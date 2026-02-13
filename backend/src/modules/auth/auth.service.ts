import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException({ error: 'EMAIL_ALREADY_EXISTS' });
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
      authProvider: 'local',
    });
    const tokens = this.issueTokens(user._id.toString());
    return { user, tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) throw new UnauthorizedException({ error: 'INVALID_CREDENTIALS' });
    const match = await bcrypt.compare(dto.password, user.password || '');
    if (!match) throw new UnauthorizedException({ error: 'INVALID_CREDENTIALS' });
    const clean = this.usersService.sanitize(user as any);
    const tokens = this.issueTokens(user._id.toString());
    return { user: clean, tokens };
  }

  async googleLogin(dto: GoogleLoginDto) {
    const { googleToken } = dto;
    const { data: tokenInfo } = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${googleToken}`,
    );
    const { email, email_verified: emailVerified, sub: googleId, aud } = tokenInfo;
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId && aud !== clientId) throw new UnauthorizedException('INVALID_TOKEN');
    if (!emailVerified) throw new UnauthorizedException('EMAIL_NOT_VERIFIED');

    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    let user: any = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        firstName: profile.given_name,
        lastName: profile.family_name,
        email,
        googleId,
        profileImage: profile.picture,
        authProvider: 'google',
      });
    } else {
      if (!user.googleId) (user as any).googleId = googleId;
      if (user.authProvider === 'local') (user as any).authProvider = 'google';
      await (user as any).save?.();
    }

    const tokens = this.issueTokens((user as any)._id.toString());
    return { user, tokens };
  }

  refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
      });
      return this.issueTokens(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  issueTokens(userId: string): TokenPair {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_SECRET') || 'changeme',
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }
}

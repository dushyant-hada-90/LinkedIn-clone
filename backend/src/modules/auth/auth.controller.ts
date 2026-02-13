import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.signup(dto);
    this.attachCookies(res, tokens);
    return { user, message: 'Signed up successfully' };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    this.attachCookies(res, tokens);
    return { user, message: 'Logged in successfully' };
  }

  @Post('google')
  async google(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.googleLogin(dto);
    this.attachCookies(res, tokens);
    return { user, message: 'Google login successful' };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string, @Res({ passthrough: true }) res: Response) {
    const tokens = this.authService.refresh(refreshToken);
    this.attachCookies(res, tokens);
    return { message: 'Tokens refreshed' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  private attachCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProd = (this.config.get<string>('NODE_ENV') || '').toLowerCase() === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }
}

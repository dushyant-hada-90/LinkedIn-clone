import { Body, Controller, Get, Param, Patch, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: { userId: string }) {
    return this.usersService.findById(user.userId);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.usersService.search(query || '');
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ],
      { dest: 'tmp/' },
    ),
  )
  async updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateProfileDto,
    @UploadedFiles()
    files: { profileImage?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
  ) {
    return this.usersService.updateProfile(user.userId, dto, files);
  }
}

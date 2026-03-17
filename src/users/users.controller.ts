import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      level: user.level,
      favorites: user.favorites,
      address: user.address,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/:productId')
  async toggleFavorite(@Req() req: any, @Param('productId') productId: string) {
    const user = await this.usersService.toggleFavorite(req.user.userId, productId);
    return { favorites: user.favorites };
  }
}

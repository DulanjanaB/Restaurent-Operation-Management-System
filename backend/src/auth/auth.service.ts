import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditLogService } from '../audit-log/audit-log.service';

export interface LoginContext {
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async login(username: string, password: string, context: LoginContext) {
    const user = await this.usersService.findByUsernameWithPassword(username);
    if (
      !user ||
      !(await bcrypt.compare(password, user.password_hash)) ||
      user.status !== 'active'
    ) {
      // Login isn't a database mutation, so the audit subscriber can't
      // catch it — logged explicitly here, success or failure. See
      // docs/audit-log-design.md#capture-mechanism--automatic-not-per-call.
      await this.auditLogService.record({
        action: 'login_failed',
        entityType: 'User',
        entityLabel: username,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    await this.auditLogService.record({
      action: 'login',
      entityType: 'User',
      actorId: user.id,
      actorName: user.name,
      entityId: user.id,
      entityLabel: user.username,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        primary_branch_id: user.primary_branch_id,
      },
    };
  }
}

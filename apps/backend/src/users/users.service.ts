import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', name: 'Ali Khan', email: 'ali@example.com' },
    { id: '2', name: 'Sara Ahmed', email: 'sara@example.com' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(dto: { name: string; email: string }): User {
    const user: User = {
      id: String(Date.now()),
      ...dto,
    };
    this.users.push(user);
    return user;
  }

  update(id: string, dto: Partial<{ name: string; email: string }>): User | undefined {
    const user = this.findOne(id);
    if (!user) return undefined;
    Object.assign(user, dto);
    return user;
  }

  remove(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
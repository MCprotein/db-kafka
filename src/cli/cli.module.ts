import { Module } from '@nestjs/common';
import { CliController } from './cli.controller';
import { ConsoleModule } from 'nestjs-console';

@Module({ imports: [ConsoleModule], providers: [CliController] })
export class CliModule {}

import { BootstrapConsole } from 'nestjs-console';
import { CliModule } from './cli/cli.module';

async function main() {
  const bootstrap = new BootstrapConsole({
    module: CliModule,
    useDecorators: true,
  });

  const app = await bootstrap.init();
  await app.init();
  await bootstrap.boot();
  await app.close();
}

main();

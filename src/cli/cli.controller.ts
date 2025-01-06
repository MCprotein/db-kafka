import { Command, Console } from 'nestjs-console';

@Console({
  command: 'cli',
})
export class CliController {
  constructor() {}

  @Command({
    command: 'product',
    description: 'Create a product',
    options: [
      {
        flags: '-a, --array <string...>',
      },
    ],
  })
  createProduct(args) {
    console.log(args);
    console.log('Product created');
  }
}

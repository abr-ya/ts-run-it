export class FfmpegBuilder {
  private inputPath: string;
  private options: Map<string, string> = new Map();

  constructor() {
    this.options.set('-c:v', 'libx264');
    this.options.set('-c:a', 'copy');
    this.options.set('-preset', 'fast');
  }

  input(inputPath: string): this {
    this.inputPath = inputPath;

    return this;
  }

  scaleTo(width: number): this {
    this.options.set('-vf', `scale=${width}:-1`);

    return this;
  }

  setCrf(crf: number): this {
    this.options.set('-crf', crf.toString());

    return this;
  }

  output(outputPath: string): string[] {
    if (!this.inputPath) throw new Error('Не задан параметр input');
    const args: string[] = ['-i', this.inputPath];

    this.options.forEach((value, key) => args.push(key, value));
    args.push(outputPath);

    console.log('generate args:', args);

    return args;
  }
}

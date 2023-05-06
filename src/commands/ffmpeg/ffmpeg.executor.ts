import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { CommandExecutor } from '../../core/executor/command.executor';
import { FileService } from '../../core/files/file.service';
import { IStreamLogger } from '../../core/handlers/stream-logger.interface';
import { StreamHandler } from '../../core/handlers/stream.handler';
import { PromptService } from '../../core/prompt/prompt.service';
import { FfmpegBuilder } from './ffmpeg.builder';
import { ICommandExecFfmpeg, IFfmpegInput } from './ffmpeg.types';

export class FfmpegExecutor extends CommandExecutor<IFfmpegInput> {
	private fileService: FileService = new FileService();
	private promptService: PromptService = new PromptService();

	constructor(logger: IStreamLogger) {
		super(logger);
	}

	protected async prompt(): Promise<IFfmpegInput> {
		const width = await this.promptService.input<number>('Scale to (ширина, высота - авто)', 'number');
		const crf = await this.promptService.input<number>('Quality (0 - без потерь, 18 - почти без потерь, 23 - default, 51 - max)', 'number');
		const path = await this.promptService.input<string>('Input path', 'input');
		const name = await this.promptService.input<string>('Output name', 'input');

		return { crf, width, path, name };
	}

	protected build({ crf, width, path, name }: IFfmpegInput): ICommandExecFfmpeg {
		const output = this.fileService.getFilePath(path, name, 'mp4');
		const args = (new FfmpegBuilder)
			.input(path)
			.scaleTo(width)
      .setCrf(crf)
			.output(output);

		return { command: 'ffmpeg', args, output };
	}

	protected spawn({ output, command, args }: ICommandExecFfmpeg): ChildProcessWithoutNullStreams {
		this.fileService.deleteFileIfExists(output);
    console.log('run', command, 'with args:', args.join(' '));

		return spawn(command, args);
	}

	protected processStream(stream: ChildProcessWithoutNullStreams, logger: IStreamLogger): void {
		const handler = new StreamHandler(logger);
		handler.processOutput(stream);
	}
}

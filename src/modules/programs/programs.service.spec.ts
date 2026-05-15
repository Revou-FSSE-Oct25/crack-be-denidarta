import { NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramRepository } from './programs.repository';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let repo: jest.Mocked<Pick<ProgramRepository, 'findOne'>>;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    service = new ProgramsService(repo as unknown as ProgramRepository);
  });

  it('throws NotFoundException when findOne returns null', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});

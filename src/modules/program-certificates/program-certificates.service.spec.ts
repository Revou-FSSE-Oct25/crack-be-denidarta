import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProgramCertificatesService } from './program-certificates.service';
import { ProgramCertificatesRepository } from './program-certificates.repository';

const mockRepo = {
  findEnrollment: jest.fn(),
  findProgram: jest.fn(),
  findAssignmentsWithSubmissions: jest.fn(),
  findCertificate: jest.fn(),
  createCertificate: jest.fn(),
  findCertificateByUserAndProgram: jest.fn(),
  findUserCertificatesPaginated: jest.fn(),
  findAllCertificatesPaginated: jest.fn(),
};

const mockCert = {
  id: 'cert-1',
  certNumber: 'CERT-ABC',
  fileUrl: null,
  studentNameSnapshot: 'Alice',
  programNameSnapshot: 'Prog A',
  issuedAt: new Date(),
  userId: 'u1',
  programId: 'p1',
  user: null,
  program: null,
};

describe('ProgramCertificatesService', () => {
  let service: ProgramCertificatesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramCertificatesService,
        { provide: ProgramCertificatesRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(ProgramCertificatesService);
  });

  it('should be defined', () => {
    expect(service).toBeInstanceOf(ProgramCertificatesService);
  });

  it('checkEligibility throws NotFoundException when enrollment absent', async () => {
    mockRepo.findEnrollment.mockResolvedValue(null);
    await expect(service.checkEligibility('p1', 'e1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getAllCertificates returns paginated envelope', async () => {
    mockRepo.findAllCertificatesPaginated.mockResolvedValue([[mockCert], 1]);
    const mockUser = { sub: 'u1', role: 'admin' };
    const result = await service.getAllCertificates(mockUser as any, {
      page: 1,
      limit: 10,
    });
    expect(result).toHaveProperty('data');
    expect(result.meta.total).toBe(1);
  });

  it('getMyCertificates returns paginated envelope', async () => {
    mockRepo.findUserCertificatesPaginated.mockResolvedValue([[mockCert], 1]);
    const mockUser = { sub: 'u1', role: 'student' };
    const result = await service.getMyCertificates(mockUser as any, {
      page: 1,
      limit: 10,
    });
    expect(result).toHaveProperty('data');
    expect(result.meta.total).toBe(1);
  });
});

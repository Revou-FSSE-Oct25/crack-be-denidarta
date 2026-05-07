import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';

@Injectable()
export class LearningMaterialRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLearningMaterialDto) {
    const { courseIds, programIds, ...materialData } = dto;

    const learningMaterial = await this.prisma.learningMaterial.create({
      data: materialData,
      include: {
        uploader: { include: { profile: true } },
        courses: true,
        programs: true,
      },
    });

    // Assign to courses
    if (courseIds && courseIds.length > 0) {
      await Promise.all(
        courseIds.map((courseId) =>
          this.prisma.learningMaterialCourse.create({
            data: {
              learningMaterialId: learningMaterial.id,
              courseId,
              orderIndex: 0,
            },
          }),
        ),
      );
    }

    // Assign to programs
    if (programIds && programIds.length > 0) {
      await Promise.all(
        programIds.map((programId) =>
          this.prisma.learningMaterialProgram.create({
            data: {
              learningMaterialId: learningMaterial.id,
              programId,
              orderIndex: 0,
            },
          }),
        ),
      );
    }

    return this.findOne(learningMaterial.id);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.learningMaterial.findMany({
        where: { deletedAt: null },
        include: {
          uploader: { include: { profile: true } },
          courses: { include: { course: true } },
          programs: { include: { program: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.learningMaterial.count({ where: { deletedAt: null } }),
    ]);
    return {
      data,
      total,
      page,
      limit,
    };
  }

  findOne(id: string) {
    return this.prisma.learningMaterial.findUnique({
      where: { id },
      include: {
        uploader: { include: { profile: true } },
        courses: { include: { course: true } },
        programs: { include: { program: true } },
      },
    });
  }

  async update(id: string, dto: UpdateLearningMaterialDto) {
    const { courseIds, programIds, ...materialData } = dto;

    // Update material
    const learningMaterial = await this.prisma.learningMaterial.update({
      where: { id },
      data: materialData,
    });

    // Update course assignments if provided
    if (courseIds !== undefined) {
      // Remove all existing course assignments
      await this.prisma.learningMaterialCourse.deleteMany({
        where: { learningMaterialId: id },
      });

      // Add new course assignments
      if (courseIds.length > 0) {
        await Promise.all(
          courseIds.map((courseId) =>
            this.prisma.learningMaterialCourse.create({
              data: {
                learningMaterialId: id,
                courseId,
                orderIndex: 0,
              },
            }),
          ),
        );
      }
    }

    // Update program assignments if provided
    if (programIds !== undefined) {
      // Remove all existing program assignments
      await this.prisma.learningMaterialProgram.deleteMany({
        where: { learningMaterialId: id },
      });

      // Add new program assignments
      if (programIds.length > 0) {
        await Promise.all(
          programIds.map((programId) =>
            this.prisma.learningMaterialProgram.create({
              data: {
                learningMaterialId: id,
                programId,
                orderIndex: 0,
              },
            }),
          ),
        );
      }
    }

    return this.findOne(id);
  }

  async findByCourse(courseId: string) {
    // Get course with program info
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { programId: true },
    });

    if (!course) return [];

    // Materials directly assigned to this course
    const directCourseMaterials =
      await this.prisma.learningMaterialCourse.findMany({
        where: { courseId },
        include: {
          learningMaterial: {
            include: {
              uploader: { include: { profile: true } },
              courses: { include: { course: true } },
              programs: { include: { program: true } },
            },
          },
        },
      });

    // Materials assigned to the program (accessible via any course in program)
    const programMaterials = course.programId
      ? await this.prisma.learningMaterialProgram.findMany({
          where: { programId: course.programId },
          include: {
            learningMaterial: {
              include: {
                uploader: { include: { profile: true } },
                courses: { include: { course: true } },
                programs: { include: { program: true } },
              },
            },
          },
        })
      : [];

    // Combine and deduplicate by material ID
    const materialMap = new Map<
      string,
      any & { accessType: 'direct' | 'program' }
    >();

    directCourseMaterials.forEach((cm) => {
      materialMap.set(cm.learningMaterial.id, {
        ...cm.learningMaterial,
        accessType: 'direct',
      });
    });

    programMaterials.forEach((pm) => {
      if (!materialMap.has(pm.learningMaterial.id)) {
        materialMap.set(pm.learningMaterial.id, {
          ...pm.learningMaterial,
          accessType: 'program',
        });
      }
    });

    return Array.from(materialMap.values());
  }

  async findByProgram(programId: string) {
    return this.prisma.learningMaterialProgram.findMany({
      where: { programId },
      include: {
        learningMaterial: {
          include: {
            uploader: { include: { profile: true } },
            courses: { include: { course: true } },
            programs: { include: { program: true } },
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.learningMaterial.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

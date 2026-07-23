import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Role } from '../assessment/entities/role.entity';
import { Category } from '../assessment/entities/category.entity';
import { Question } from '../assessment/entities/question.entity';
import { Option } from '../assessment/entities/option.entity';
import { OptionScore } from '../assessment/entities/option-score.entity';
import { Participant } from '../assessment/entities/participant.entity';
import { Assessment } from '../assessment/entities/assessment.entity';
import { Answer } from '../assessment/entities/answer.entity';

/**
 * DataSource independiente del contenedor de Nest, para scripts de CLI
 * (seed y, más adelante, migraciones).
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'xray',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    Role,
    Category,
    Question,
    Option,
    OptionScore,
    Participant,
    Assessment,
    Answer,
  ],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});

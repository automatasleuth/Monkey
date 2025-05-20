import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import scrapeRouter from './api/routes/scrape';
import mapRouter from './api/routes/map';
import crawlRouter from './api/routes/crawl';
import searchRouter from './api/routes/search';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const logger = new Logger('App');
const port = process.env.PORT || 8080;

// Log startup information
logger.info('Starting application...');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Port: ${port}`);
logger.info(`Redis Host: ${process.env.REDIS_HOST}`);
logger.info(`Redis Port: ${process.env.REDIS_PORT}`);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/scrape', scrapeRouter);
app.use('/api/map', mapRouter);
app.use('/api/crawl', crawlRouter);
app.use('/api/search', searchRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server with enhanced error handling
const startServer = async () => {
  try {
    // Start the server immediately without waiting for Redis
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    }).on('error', (err) => {
      logger.error('Failed to start server:', err);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
}); 
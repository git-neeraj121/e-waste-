import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import facilityRoutes from './routes/facilityRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import detectionRoutes from './routes/detectionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await initDB();
    
    app.use(cors());
    
    // Increase JSON body payload size limits to support base64 camera image uploads
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Request logger middleware
    app.use((req, res, next) => {
      console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
      next();
    });

    // Mount Modular Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/facilities', facilityRoutes);
    app.use('/api/pickups', pickupRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/detect-waste', detectionRoutes);

    // Global Error Handling Middleware
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Express MVC server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal: Failed to bootstrap Express MVC server:', error);
    process.exit(1);
  }
}

bootstrap();

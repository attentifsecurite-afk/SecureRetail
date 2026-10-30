import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const shopguardRouter = Router();

shopguardRouter.use(authenticate);

// ShopGuard AI Engine Status
shopguardRouter.get('/status', asyncHandler(async (req, res) => {
  // In a real implementation, this would check the actual ShopGuard Python service
  const status = {
    engine: 'running',
    device: 'cuda',
    workers: 2,
    memory: {
      used: 3500,
      total: 6144,
      percentage: 57,
    },
    models: {
      detector: 'YOLO26s',
      pose: 'YOLO26n-Pose',
      tracker: 'BoT-SORT',
    },
    cameras: 6,
    uptime: '24h 15m',
  };

  res.json({
    success: true,
    data: status,
  });
}));

// Get camera analysis results
shopguardRouter.get('/cameras/:cameraId/results', asyncHandler(async (req, res) => {
  const { cameraId } = req.params;

  // In a real implementation, this would fetch from the ShopGuard service
  const results = {
    cameraId,
    timestamp: new Date().toISOString(),
    detections: [
      {
        class: 'person',
        confidence: 0.95,
        bbox: [100, 50, 300, 400],
        track_id: 1,
      },
      {
        class: 'backpack',
        confidence: 0.87,
        bbox: [150, 200, 250, 350],
        track_id: 1,
      },
    ],
    tracks: 2,
    pose_count: 1,
    decision: {
      alert: false,
      level: 'none',
      confidence: 0.15,
      reason: 'Aucun signal fort - situation normale',
      recommended_action: 'none',
    },
    latency_ms: 45,
    fps: 28,
  };

  res.json({
    success: true,
    data: results,
  });
}));

// Get active alerts from ShopGuard
shopguardRouter.get('/alerts', asyncHandler(async (req, res) => {
  // In a real implementation, this would fetch from the ShopGuard service
  const alerts = [
    {
      id: 'AL-001',
      camera_id: 'entrance',
      location: 'Entrée principale - Paris Châtelet',
      level: 'high',
      reason: 'Groupe avec sacs en zone sensible - comportement suspect détecté',
      action: 'staff_check',
      timestamp: new Date().toISOString(),
      detections_count: 5,
      confidence: 0.82,
    },
  ];

  res.json({
    success: true,
    data: alerts,
  });
}));

// Configure ShopGuard settings
shopguardRouter.post('/config', asyncHandler(async (req: AuthRequest, res) => {
  const {
    detector,
    pose_model,
    use_tensorrt,
    enable_pose,
    num_workers,
    queue_size,
    conf,
    max_memory_mb,
  } = req.body;

  // In a real implementation, this would update the ShopGuard service configuration
  const config = {
    detector: detector || 'yolo26s.pt',
    pose_model: pose_model || 'yolo26n-pose.pt',
    use_tensorrt: use_tensorrt || false,
    enable_pose: enable_pose !== false,
    num_workers: num_workers || 2,
    queue_size: queue_size || 64,
    conf: conf || 0.40,
    max_memory_mb: max_memory_mb || 6144,
  };

  res.json({
    success: true,
    data: config,
    message: 'Configuration updated successfully',
  });
}));

// Start/Stop ShopGuard engine
shopguardRouter.post('/engine/:action', asyncHandler(async (req: AuthRequest, res) => {
  const { action } = req.params;

  if (!['start', 'stop'].includes(action)) {
    res.status(400).json({
      success: false,
      error: 'Invalid action. Must be "start" or "stop"',
    });
    return;
  }

  // In a real implementation, this would control the ShopGuard service
  res.json({
    success: true,
    data: {
      engine: action === 'start' ? 'running' : 'stopped',
      message: `Engine ${action}ed successfully`,
    },
  });
}));

// Get ShopGuard metrics
shopguardRouter.get('/metrics', asyncHandler(async (req, res) => {
  // In a real implementation, this would fetch real metrics from the ShopGuard service
  const metrics = {
    total_frames: 1250,
    total_alerts: 8,
    avg_latency: 45,
    avg_fps: 28,
    avg_memory: 3500,
    uptime_hours: 24,
    detections_by_class: {
      person: 850,
      backpack: 120,
      handbag: 80,
      bottle: 45,
      'cell phone': 30,
      'shopping cart': 25,
    },
    alerts_by_level: {
      none: 1200,
      low: 35,
      medium: 10,
      high: 5,
      critical: 0,
    },
  };

  res.json({
    success: true,
    data: metrics,
  });
}));

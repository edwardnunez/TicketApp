
import cron from 'node-cron';

class EventStateService {
  constructor() {
    this.lastUpdate = 0;
  }

  async updateEventStates() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log(`[${now.toISOString()}] Actualizando estados de eventos...`);

      // 1. Finalizar eventos pasados (excepto cancelados)
      const finalizadosResult = await EventModel.updateMany(
        {
          date: { $lt: today },
          state: { $in: ['activo', 'proximo'] }
        },
        { $set: { state: 'finalizado' } }
      );

      // 2. Activar eventos de hoy
      const activosResult = await EventModel.updateMany(
        {
          date: { $gte: today, $lt: tomorrow },
          state: 'proximo'
        },
        { $set: { state: 'activo' } }
      );

      const result = {
        finalizados: finalizadosResult.modifiedCount,
        activados: activosResult.modifiedCount,
        timestamp: now.toISOString()
      };

      if (result.finalizados > 0 || result.activados > 0) {
        console.log('Estados actualizados:', result);
      }

      return result;
    } catch (error) {
      console.error('Error actualizando estados:', error);
      return { error: error.message };
    }
  }

  startCronJobs() {
    // Actualización diaria a las 00:01
    cron.schedule('1 0 * * *', async () => {
      console.log('🕐 Ejecutando actualización diaria de estados...');
      await this.updateEventStates();
    });

    // Activación horaria de eventos del día
    cron.schedule('0 * * * *', async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await EventModel.updateMany(
        {
          date: { $gte: today, $lt: tomorrow },
          state: 'proximo'
        },
        { $set: { state: 'activo' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`⏰ Activados ${result.modifiedCount} eventos en revisión horaria`);
      }
    });

    console.log('✅ Cron jobs configurados para actualización de estados');
  }

  // Middleware para actualizar estados automáticamente
  async updateStatesMiddleware(req, res, next) {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - this.lastUpdate > fiveMinutes) {
      await this.updateEventStates();
      this.lastUpdate = now;
    }
    next();
  }
    setEventModel(eventModel) {
    this.EventModel = eventModel;
    // Make EventModel available globally for the methods above
    global.EventModel = eventModel;
  }
}

export default EventStateService;
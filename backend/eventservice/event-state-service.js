import cron from 'node-cron';

class EventStateService {
  constructor() {
    this.lastUpdate = 0;
    this.cronJobs = [];
  }

  async updateEventStates() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log(`[${now.toISOString()}] Actualizando estados de eventos...`);

      // Usar el EventModel del servicio
      const EventModel = this.EventModel || global.EventModel;
      if (!EventModel) {
        console.log('EventModel no disponible, saltando actualización de estados');
        return { finalizados: 0, activados: 0, timestamp: now.toISOString() };
      }

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
    const dailyJob = cron.schedule('1 0 * * *', async () => {
      console.log('🕐 Ejecutando actualización diaria de estados...');
      await this.updateEventStates();
    });

    // Activación horaria de eventos del día
    const hourlyJob = cron.schedule('0 * * * *', async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const EventModel = this.EventModel || global.EventModel;
      if (!EventModel) {
        console.log('EventModel no disponible en cron job');
        return;
      }

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

    // Guardar referencias para poder detenerlos
    this.cronJobs.push(dailyJob, hourlyJob);

    console.log('✅ Cron jobs configurados para actualización de estados');
  }

  stopCronJobs() {
    console.log('🛑 Deteniendo cron jobs...');
    this.cronJobs.forEach(job => {
      if (job && typeof job.stop === 'function') {
        job.stop();
      }
    });
    this.cronJobs = [];
    console.log('✅ Cron jobs detenidos');
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
    global.EventModel = eventModel;
  }
}

export default EventStateService;

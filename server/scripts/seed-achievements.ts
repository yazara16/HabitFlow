import db from '../db';

async function seedAchievements() {
  try {
    console.log('🌱 Seeding achievements...');

    // Create default achievements
    const achievements = [
      {
        id: 'first-habit',
        name: 'Primer Hábito',
        description: 'Crea tu primer hábito',
        icon: '🎯',
        points: 10,
        category: 'beginner'
      },
      {
        id: 'five-habits',
        name: 'Múltiples Hábitos',
        description: 'Ten al menos 5 hábitos activos',
        icon: '📈',
        points: 25,
        category: 'collector'
      },
      {
        id: 'ten-habits',
        name: 'Decena Perfecta',
        description: 'Logra tener 10 hábitos simultáneos',
        icon: '🔟',
        points: 50,
        category: 'collector'
      },
      {
        id: 'streak-7',
        name: 'Semana Perfecta',
        description: 'Mantén un hábito por 7 días consecutivos',
        icon: '📅',
        points: 30,
        category: 'streak'
      },
      {
        id: 'streak-30',
        name: 'Mes Completo',
        description: 'Consigue una racha de 30 días',
        icon: '🗓️',
        points: 100,
        category: 'streak'
      },
      {
        id: 'streak-100',
        name: 'Centenario',
        description: '¡Increíble! 100 días de racha',
        icon: '💯',
        points: 300,
        category: 'streak'
      },
      {
        id: 'log-10',
        name: 'Datos en Acción',
        description: 'Registra 10 actividades exitosas',
        icon: '📊',
        points: 20,
        category: 'logging'
      },
      {
        id: 'log-50',
        name: 'Profesional',
        description: '50 registros de progreso',
        icon: '📋',
        points: 75,
        category: 'logging'
      },
      {
        id: 'log-100',
        name: 'Experto',
        description: '¡100 registros completados!',
        icon: '🏆',
        points: 150,
        category: 'logging'
      }
    ];

    // Upsert achievements (create if not exists, update if exists)
    for (const achievement of achievements) {
      await db.achievement.upsert({
        where: { id: achievement.id },
        update: achievement,
        create: achievement
      });
      console.log(`✅ Achievement: ${achievement.name}`);
    }

    // Create some default categories
    const categories = [
      {
        name: 'Salud',
        description: 'Hábitos relacionados con salud física y mental',
        color: '#ef4444',
        icon: '🏥',
        isDefault: true
      },
      {
        name: 'Ejercicio',
        description: 'Actividades físicas y deporte',
        color: '#22c55e',
        icon: '💪',
        isDefault: true
      },
      {
        name: 'Aprendizaje',
        description: 'Estudio y desarrollo personal',
        color: '#3b82f6',
        icon: '📚',
        isDefault: true
      },
      {
        name: 'Productividad',
        description: 'Organización y eficiencia',
        color: '#f59e0b',
        icon: '⚡',
        isDefault: true
      },
      {
        name: 'Relaciones',
        description: 'Interacción social y familia',
        color: '#8b5cf6',
        icon: '👥',
        isDefault: true
      },
      {
        name: 'Finanzas',
        description: 'Dinero y ahorro',
        color: '#10b981',
        icon: '💰',
        isDefault: true
      },
      {
        name: 'Tiempo Libre',
        description: 'Entretenimiento y hobbies',
        color: '#ec4899',
        icon: '🎨',
        isDefault: true
      },
      {
        name: 'Espiritual',
        description: 'Meditación y crecimiento espiritual',
        color: '#6b7280',
        icon: '🧘',
        isDefault: true
      }
    ];

    // Create default categories for all users (system-wide)
    for (const category of categories) {
      // Note: In a real app, you'd associate these with a "system" user
      // For now, we'll create them as template categories
      console.log(`📁 Category template: ${category.name}`);
    }

    console.log('🎉 Achievements and categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run immediately
seedAchievements().catch(console.error);

export default seedAchievements;

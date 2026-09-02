const { WODGenerator } = require('./src/engine/wodGenerator');
const { FatigueEngine } = require('./src/engine/fatigueEngine');

const fullBoxUser = {
  id: 'u1',
  name: 'Athlete One',
  age: 28,
  weightKg: 82,
  heightCm: 180,
  gender: 'male',
  division: 'INTERMEDIATE',
  unitPreference: 'metric',
  equipmentPreset: 'full_box',
  availableEquipment: [
    'barbell_and_plates',
    'pull_up_bar',
    'gymnastics_rings',
    'dumbbells',
    'kettlebells',
    'concept2_rower',
    'concept2_skierg',
    'concept2_bike_erg',
    'assault_echo_bike',
    'wall_ball',
    'plyo_box',
    'jump_rope',
    'ghd',
    'climbing_rope',
    'bench',
    'squat_rack',
  ],
  injuries: [],
  skills: {},
  oneRepMaxes: { snatch: 85, cleanAndJerk: 110, backSquat: 145, deadlift: 185, strictPress: 65, thruster: 80, powerClean: 105, powerSnatch: 80 },
};

const travelUser = {
  ...fullBoxUser,
  division: 'FOUNDATION',
  equipmentPreset: 'travel_minimal',
  availableEquipment: ['dumbbells', 'kettlebells', 'jump_rope'],
};

const fatigue = FatigueEngine.calculateFatigue([]);

console.log('--- TEST 1: Full Box Regenerate x 3 ---');
for (let i = 1; i <= 3; i++) {
  const s = WODGenerator.generateSession(fullBoxUser, fatigue);
  console.log(`[FullBox Run ${i}] Title: ${s.title}`);
  console.log(`  Part A: ${s.partAStrength?.title || 'None'}`);
  console.log(`  Part B MetCon movements:`, s.partBMetCon.movements.map(m => `${m.name} (${m.scaledDescription || m.rxDescription || ''})`).join(' | '));
}

console.log('\n--- TEST 2: Travel Minimal (No Barbell / No Rig) ---');
for (let i = 1; i <= 3; i++) {
  const s = WODGenerator.generateSession(travelUser, fatigue);
  console.log(`[Travel Run ${i}] Title: ${s.title}`);
  console.log(`  Part A: ${s.partAStrength?.title || 'None'}`);
  console.log(`  Part B MetCon movements:`, s.partBMetCon.movements.map(m => `${m.name} (${m.scaledDescription || m.rxDescription || ''})`).join(' | '));
}

import { createInitialMissionState, generateKarantinaData } from '../src/services/gameFactory';
import { applyLocalGameAction } from '../src/services/localGameEngine';
import { MissionState } from '../src/types/game';

console.log('☣️ Testing Karantina 2088 // Protokolü Game Engine & Flow...');

// 1. Data generation test
const initial = createInitialMissionState('KR88-Z9', 'karantina_protokolu', 'Baş Biyolog Selin');
initial.operationTheme = 'karantina_2088';
initial.karantinaData = generateKarantinaData();
if (!initial.karantinaData) {
  throw new Error('karantinaData was not initialized for karantina_2088');
}
console.log('✓ Karantina data initialized successfully');

let state: MissionState = {
  ...initial,
  status: 'phase_game',
  currentPhaseIndex: 0,
};

// 2. Phase 1: Bio transmits diagnosis
state = applyLocalGameAction(state, 'karantina_phase1_bio_transmit', {}, 'kaptan');
if (!state.karantinaData?.bioPhase1Transmitted) {
  throw new Error('Bio transmit failed in phase 1');
}
console.log('✓ Phase 1 Bio Transmit passed');

// 3. Phase 1: Sec solves UV & Valve
state = applyLocalGameAction(state, 'karantina_phase1_sec_solve', { sector: 3, valve: 'B' }, 'muhendis');
if (!state.karantinaData?.phase1Solved || state.currentPhaseIndex !== 1) {
  throw new Error('Phase 1 Sec solve failed or phase did not advance to 1');
}
console.log('✓ Phase 1 Sec Solve passed and transitioned to Phase 2');

// 4. Phase 2: Bio injects reagent formula
state = applyLocalGameAction(state, 'karantina_phase2_bio_inject', {}, 'kaptan');
if (!state.karantinaData?.bioPhase2Injected) {
  throw new Error('Bio reagent injection failed in phase 2');
}
console.log('✓ Phase 2 Bio Inject passed');

// 5. Phase 2: Sec solves Rotor Tachometer (3800 RPM) & Cooling (%75)
state = applyLocalGameAction(state, 'karantina_phase2_sec_solve', {
  rpm: 3800,
  coolingValvePct: 75,
}, 'muhendis');
if (!state.karantinaData?.phase2Solved || state.currentPhaseIndex !== 2) {
  throw new Error('Phase 2 Sec solve failed or phase did not advance to 2');
}
console.log('✓ Phase 2 Sec Solve passed and transitioned to Phase 3');

// 6. Phase 3: Bio starts vacuum cycle
state = applyLocalGameAction(state, 'karantina_phase3_bio_start', {}, 'kaptan');
if (!state.karantinaData?.bioPhase3Started) {
  throw new Error('Bio vacuum start failed in phase 3');
}
console.log('✓ Phase 3 Bio Start Vacuum passed');

// 7. Phase 3: Sec solves Exhaust Chimney (BACA-02) & 12 Bar Manometer
state = applyLocalGameAction(state, 'karantina_phase3_sec_solve', {
  chimney: 'BACA-02',
  bar: 12.0,
}, 'muhendis');
if (!state.karantinaData?.phase3Solved || state.status !== 'phase_result') {
  throw new Error('Phase 3 Sec solve failed or did not transition to phase_result');
}
if (state.outcomeType !== 'tam_basari') {
  throw new Error(`Expected outcomeType to be tam_basari but got ${state.outcomeType}`);
}
if (state.rescuedCrewCount !== 10 || state.completedTasksCount !== 3) {
  throw new Error(`Expected rescuedCrewCount=10 & completedTasksCount=3, got ${state.rescuedCrewCount}/${state.completedTasksCount}`);
}
console.log('✓ Phase 3 Sec Solve passed and achieved TAM_BASARI victory with accurate metrics!');

// 8. Restart game & verify full cleanup
state = applyLocalGameAction(state, 'karantina_restart', {}, 'kaptan');
if (
  state.status !== 'lobby' ||
  !state.karantinaData ||
  state.completedTasksCount !== 0 ||
  state.rescuedCrewCount !== 0 ||
  state.finalScore !== 0 ||
  state.scoreBreakdown !== undefined ||
  state.outcomeType !== undefined ||
  state.players.kaptan.ready ||
  state.players.muhendis.ready ||
  state.players.kaptan.roleConfirmed ||
  state.players.muhendis.roleConfirmed
) {
  throw new Error('Karantina restart failed to cleanly reset lobby state, scores, and player readiness');
}
console.log('✓ Karantina restart returned cleanly to lobby with full metric/player reset');

// 9. Role authorization & Bio parameter validation checks
let fresh: MissionState = {
  ...initial,
  karantinaData: generateKarantinaData(),
  status: 'phase_game',
  currentPhaseIndex: 0,
};

// Muhendis cannot trigger Bio actions
const wrongBioRole = applyLocalGameAction(fresh, 'karantina_phase1_bio_transmit', { spectralNm: 415, base: 'sitozin-9' }, 'muhendis');
if (wrongBioRole.feedbackState !== 'error' || wrongBioRole.karantinaData?.bioPhase1Transmitted) {
  throw new Error('Muhendis should be blocked from karantina_phase1_bio_transmit');
}

// Wrong Bio spectralNm/base in Phase 1 should reject & penalize time
const wrongBioData = applyLocalGameAction(fresh, 'karantina_phase1_bio_transmit', { spectralNm: 520, base: 'adenin-x' }, 'kaptan');
if (wrongBioData.feedbackState !== 'error' || wrongBioData.karantinaData?.bioPhase1Transmitted) {
  throw new Error('Wrong Bio Phase 1 parameters should be rejected');
}

// Correct Bio Phase 1 unlocks Sec solve, but Kaptan cannot execute Sec solve
fresh = applyLocalGameAction(fresh, 'karantina_phase1_bio_transmit', { spectralNm: 415, base: 'sitozin-9' }, 'kaptan');
const wrongSecRole = applyLocalGameAction(fresh, 'karantina_phase1_sec_solve', { sector: 3, valve: 'B' }, 'kaptan');
if (wrongSecRole.feedbackState !== 'error' || wrongSecRole.karantinaData?.phase1Solved) {
  throw new Error('Kaptan should be blocked from karantina_phase1_sec_solve');
}

// Phase 2 & Phase 3 Bio wrong parameters check
fresh = applyLocalGameAction(fresh, 'karantina_phase1_sec_solve', { sector: 3, valve: 'B' }, 'muhendis');
const wrongBio2 = applyLocalGameAction(fresh, 'karantina_phase2_bio_inject', { bondFreqGhz: 4.5 }, 'kaptan');
if (wrongBio2.feedbackState !== 'error' || wrongBio2.karantinaData?.bioPhase2Injected) {
  throw new Error('Wrong Bio Phase 2 bondFreqGhz should be rejected');
}
fresh = applyLocalGameAction(fresh, 'karantina_phase2_bio_inject', { bondFreqGhz: 8.4 }, 'kaptan');
fresh = applyLocalGameAction(fresh, 'karantina_phase2_sec_solve', { rpm: 3800, coolingValvePct: 75 }, 'muhendis');

const wrongBio3 = applyLocalGameAction(fresh, 'karantina_phase3_bio_start', { vacuumFlowRate: 3.0 }, 'kaptan');
if (wrongBio3.feedbackState !== 'error' || wrongBio3.karantinaData?.bioPhase3Started) {
  throw new Error('Wrong Bio Phase 3 vacuumFlowRate should be rejected');
}
console.log('✓ Role authorization and Bio parameter validations passed!');

console.log('☣️ ALL KARANTİNA 2088 TESTS PASSED (100% OK)!');

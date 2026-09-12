import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectActiveStory, mapLiftProgress } from '../src/scripts/japan-scroll.ts';

test('the map stays in the book until the stage reaches the viewport top', () => {
  assert.equal(mapLiftProgress(80, 780), 0);
  assert.equal(mapLiftProgress(0, 700), 0);
});

test('the lift grows continuously and reverses along the same scroll positions', () => {
  const positions = [0, 175, 350, 525, 700];
  assert.deepEqual(positions.map(y => mapLiftProgress(-y, 700-y)), [0, .25, .5, .75, 1]);
  assert.deepEqual(positions.reverse().map(y => mapLiftProgress(-y, 700-y)), [1, .75, .5, .25, 0]);
});

test('card deep links and the end of the journal keep the map in its dock', () => {
  assert.equal(mapLiftProgress(-1200, 0), 1);
  assert.equal(mapLiftProgress(-2400, -120), 1);
});

test('reduced motion changes directly between book and dock without a travelling map', () => {
  assert.equal(mapLiftProgress(-350, 350, true), 0);
  assert.equal(mapLiftProgress(-700, 0, true), 1);
});

test('cards covered by the sticky map cannot take the highlight', () => {
  assert.equal(selectActiveStory([
    {id:'osaka',top:70,bottom:270},
    {id:'koyasan',top:310,bottom:500},
    {id:'kyoto',top:530,bottom:720},
  ],300,800),'koyasan');
});

test('multiple visible compact cards produce one stable selection', () => {
  const cards = [{id:'osaka',top:280,bottom:450},{id:'koyasan',top:460,bottom:630},{id:'kyoto',top:640,bottom:810}];
  assert.equal(selectActiveStory(cards,300,900),'koyasan');
  assert.equal(selectActiveStory(cards.map(card=>({...card,top:card.top+2,bottom:card.bottom+2})),300,900),'koyasan');
});

test('scrolling backward and changing the sticky height can select the previous card', () => {
  const cards = [{id:'osaka',top:190,bottom:330},{id:'koyasan',top:345,bottom:485}];
  assert.equal(selectActiveStory(cards,280,500),'koyasan');
  assert.equal(selectActiveStory(cards,100,500),'osaka');
});

test('before the list or between widely spaced cards the controller can retain its existing state', () => {
  assert.equal(selectActiveStory([{id:'tokyo',top:900,bottom:1100}],300,800),undefined);
  assert.equal(selectActiveStory([],200,600),undefined);
});

test('the last visible card remains eligible at the bottom of the journal', () => {
  assert.equal(selectActiveStory([{id:'kamakura',top:140,bottom:370}],300,800),'kamakura');
});

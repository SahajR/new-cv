import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectActiveStory, mapLiftProgress, storyScrollTail } from '../src/scripts/travel-scroll.ts';

test('the final stop gains enough scroll room to reach the map on a tall screen', () => {
  const cards = [
    {id:'taj-mahal',top:331.2,bottom:522.7},
    {id:'agra-fort',top:522.7,bottom:714.2},
    {id:'rajgad-fort',top:809.4,bottom:1000.9},
  ];
  const tail = storyScrollTail(1200, 386, 1200 - cards.at(-1).top);
  assert.equal(selectActiveStory(cards,362,1200),'agra-fort');
  assert.ok(cards.at(-1).top-tail <= 386);
  assert.equal(selectActiveStory(cards.map(card => ({...card, top:card.top-tail, bottom:card.bottom-tail})),362,1200),'rajgad-fort');
});

test('every trailing card can reach the highlight in both scroll directions', () => {
  const cards = [0,1,2,3].map(i => ({id:`stop-${i}`,top:450+i*200,bottom:640+i*200}));
  const tail = storyScrollTail(1400,386,1400-cards.at(-1).top);
  const selections = cards.map(card => {
    const scroll = card.top-386;
    assert.ok(scroll <= tail);
    return selectActiveStory(cards.map(item => ({...item,top:item.top-scroll,bottom:item.bottom-scroll})),362,1400);
  });
  assert.deepEqual(selections,cards.map(card => card.id));
  assert.deepEqual(cards.toReversed().map(card => selectActiveStory(cards.map(item => ({...item,top:item.top-card.top+386,bottom:item.bottom-card.top+386})),362,1400)),selections.toReversed());
});

test('existing content after the stops avoids unnecessary trailing space', () => {
  assert.equal(storyScrollTail(844,229,900),0);
  assert.equal(storyScrollTail(720,285,435),0);
});

test('trailing space shrinks with the viewport and rounds up fractional pixels', () => {
  assert.equal(storyScrollTail(844,228.5,390.25),226);
  assert.equal(storyScrollTail(720,285,390.25),45);
});

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

test('scrolling directly into the illustrated ending selects the final stop', () => {
  assert.equal(selectActiveStory([
    {id:'aqaba',top:-230.8,bottom:-39.3},
    {id:'dead-sea',top:-39.3,bottom:152.2},
  ],152.2,720),'dead-sea');
});

test('a short story aligned below a map without a footer keeps its selected highlight', () => {
  assert.equal(selectActiveStory([
    {id:'fuji-lawson',top:228.5,bottom:424.9},
    {id:'oshino-hakkai',top:424.9,bottom:621.2},
  ],204.5,844),'fuji-lawson');
});

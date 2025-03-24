<template>
  <!-- <div class="pBreak">
    <br />
    <div class="icon">⁂</div>
    <br />
    <br />
  </div> -->
  <div class="pBreak">
    <div class="line"></div>
    <div class="icon">⁂</div>
    <div class="line"></div>
  </div>
  <!-- <div class="pBreak">
    <div class="lineBox">
      <div class="dateBox"><strong>28</strong>th</div>
      <div class="line"></div>
    </div>
    <div class="icon">⁂</div>
    <div class="lineBox">
      <div class="line"></div>
    </div>
  </div> -->
</template>

<style>
.dateBox {
  /* position: absolute; */
  z-index: 2;
  color: var(--md-sys-color-on-surface);
  font-size: 1em;
  font-family: 'Libre Caslon Text', serif;
  color: var(--primary);

  font-optical-sizing: auto;
  font-weight: 600;
  left: 2em;
  strong {
    font-size: 2.2em;
  }
}

.cont {
  display: flex;
  align-items: center;
  width: 100%;
}
.line {
  flex-grow: 1;
  margin: 0 1em;
  border-top: 1px solid var(--primary);
}
.lineBox {
  display: flex;
  flex-grow: 2;
  align-items: center;
}
.icon {
  font-size: 1.4em;
}

.pBreak {
  position: relative;
  z-index: 2;
  color: var(--md-sys-color-on-surface);
  /* font-size: 2em; */
  font-family: 'Libre Caslon Text', serif;
  color: var(--primary);
  /* font-size: 1.4em; */
  font-family: 'Public Sans', sans-serif;

  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  text-align: center;
  /* padding: 0 !important; */

  display: flex;
  align-items: center;
  justify-content: center;
  /* width: 100%; */
}
</style>

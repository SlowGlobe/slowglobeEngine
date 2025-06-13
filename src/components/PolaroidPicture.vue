<script setup lang="ts">
defineProps({
  imgUrl: String,
  link: String,
  caption: String
})
</script>

<template>
  <div class="container stickyCard" id="polaroidCard">
    <RouterLink :to="link ?? ''">
      <div class="polaroid">
        <div class="polaroid-img">
          <img :src="imgUrl" />
        </div>
        <div class="polaroid-caption">{{ caption }}</div>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped>
.container:nth-child(4n-1) {
  transform: rotate(-4deg) translateX(-1em);
}
.container:nth-child(4n + 1) {
  transform: rotate(4deg) translateX(2em);
}
.container:nth-child(7n) {
  transform: rotate(11deg) translateX(1.6em);
}
.container:nth-child(8n + 1) {
  transform: rotate(0deg);
}
.container:nth-child(8n + 8) {
  transform: rotate(-10deg);
}
.container:nth-child(14n + 14) {
  transform: rotate(-1deg) translateX(1em);
}

.container {
  a {
    text-decoration: none;
    color: inherit;
  }
  @media (width <= 900px) {
    margin: 0px calc((100vw - (var(--polaroid-width) * 1.12)) / 2);
    transform: none !important;
    @supports (-webkit-touch-callout: none) {
      margin-bottom: calc((100vw - (var(--polaroid-width) * 1.12)) / 2);
      align-self: end;
    }
  }
  margin: 0px 10vw;
}

.stickyCard {
  position: sticky;
  /* calculated by taking the aspect ratio of 0.8, which inverted give 1.25, then adding the padding from .polaroid twice */
  /* top: calc((100vh - 4rem) / 2 - (calc(var(--polaroid-width) * 1.362 * 0.5)) - 1px); */
  top: calc((100vh) / 2 - (calc(var(--polaroid-width) * 1.362 * 0.5)));
  @media (width <= 900px) {
    /* top: calc((100vh - (var(--polaroid-width) * 1.362)) - 4em + 1px); */
    position: static;
  }
  transform-origin: center center;
  width: min-content;
  transition: all 0.5s ease;
  a {
    z-index: 2;
  }
}

.container:hover {
  transform: scale(1.05);
}

.polaroid {
  width: var(--polaroid-width);
  padding: calc(var(--polaroid-width) * 0.056);
  aspect-ratio: 0.8;
  background: #fff;
  background: linear-gradient(120deg, #fff, #ddd 60%);
  /* box-shadow:
    2px -2px 20px 0px rgba(0, 0, 0, 0.6),
    inset 4px 5px 10px 0 rgba(0, 0, 0, 0.1); */
  box-shadow: inset 4px 5px 10px 0 rgba(0, 0, 0, 0.1);
  filter: drop-shadow(2px -2px 2px rgba(0, 0, 0, 0.6));
  /* inset drop-shadow(4px 5px 10px rgba(0, 0, 0, 0.1)); */
  display: grid;
  gap: 0;

  flex-direction: column;
  justify-content: space-between;
  align-items: start;
}

.polaroid-img {
  position: relative;
  display: inline-block;
  aspect-ratio: 1/1;
  /* width: 100%; */
  width: inherit;

  background: #eee;
  overflow: hidden;
  img {
    width: 100%;
    z-index: -1;
  }
}
.polaroid-img::before {
  content: '';
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.6),
    transparent 60%,
    rgba(0, 0, 0, 0.5) 99%
  );
  box-shadow: inset 0 0 10px 1px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.polaroid-caption {
  justify-self: center;
  flex-grow: 10;
  font-family: 'Reenie Beanie', 'Courier New', Courier, monospace;
  font-size: 1.6em;
  font-weight: 400;
  font-style: normal;
  text-align: center;
  bottom: 5px;
  padding: 5px 5px;
  margin: 0;
}
</style>

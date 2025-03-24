<script setup lang="ts">
defineProps({
  image: String
})

const randomPrices = [2, 4, 5, 8, 10, 15, 20, 25, 30]
const price = randomPrices[Math.floor(Math.random() * randomPrices.length)]
</script>

<template>
  <!-- <img src="/images/stampWaves.jpg" /> -->
  <div class="postage-stamp-container">
    <div class="postage-stamp">
      <img :src="image" />
      <div class="stamp-price">{{ price }}¢</div>
      <div class="stamp-price sg">SG</div>
      <!-- <div class="stamp-price sg">SLOW GLOBE</div> -->
    </div>
  </div>
</template>

<style scoped>
.postage-stamp-container {
  display: inline-block;
  position: relative;

  background-color: white;
  --r: 4px; /* control the radius of the circles */
  padding: calc(2 * var(--r));
  /* filter: grayscale(0.6) drop-shadow(0 0 1px #0005) drop-shadow(0 0 1px #0005); */
  filter: drop-shadow(0 0 1px #0005) drop-shadow(0 0 1px #0005);

  /* filter: drop-shadow(0 0 2px #0005); */
  background:
    radial-gradient(var(--r), #0000 98%, #ffffff) round calc(-1.5 * var(--r))
      calc(-1.5 * var(--r)) / calc(3 * var(--r)) calc(3 * var(--r)),
    linear-gradient(#ffffff 0 0) no-repeat 50% / calc(100% - 3 * var(--r)) calc(100% - 3 * var(--r));
}

img {
  text-align: center;
  display: inline-block;
  width: 100%;
  height: 100%;
  /* width: 5.5em; */
  aspect-ratio: 1 / 1;
  object-fit: cover;
  /* mask-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png');
  mask-size: 944px 604px; */
  padding: 0;
}
img {
  /* filter: grayscale(10%) sepia(30%) contrast(100%) brightness(100%); */
  filter: grayscale(10%) contrast(160%) brightness(90%) sepia(50%) saturate(70%) blur(0.5px);
  /* filter: grayscale(10%) contrast(160%) brightness(50%) sepia(50%) saturate(70%) blur(0.5px); */
}
.postage-stamp {
  background-color: black;
  /* mask-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png'); */
  mask-image: url('/images/stampWavesEdit.png');
  /* mask-size: 944px 604px; */
  mask-size: 1000px 563px;
  mask-size: 360px 200px;
  /* mask-size: 10000px 5630px; */
  mask-composite: exclusion;
  width: 5.5rem;
  height: 5.5rem;
  /* width: 55rem;
    height: 55rem; */
  /* border: #808080 1px solid; */
  padding: 0;

  /* saturate(80%); */
  /* border: 5px solid #ddd; Example of a border you mentioned */
  /* box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2); */
  /* padding: 10px; */
}
.stamp-price {
  text-align: left;
  filter: blur(0.5px);
  position: absolute;
  bottom: 0rem;
  right: 0.7rem;

  font-size: 2rem;
  /* font-size: 36px; */
  color: #d4d4d4;
  color: #f0e6d5;
  text-shadow:
    1px 1px 0 rgb(39, 20, 19),
    -1px 1px 0 rgb(39, 20, 19),
    -1px -1px 0 rgb(39, 20, 19),
    1px -1px 0 rgb(39, 20, 19);
  /* text-shadow:
  2px 1px 0 #000,
  -1px 1px 0 #000,
  -1px -1px 0 #000,
  1px -1px 0 #000; */
  font-family: 'Rozha One', serif;
  font-weight: 400;
  font-style: normal;
}

.sg {
  color: #d4d4d4;
  font-size: 0.8em;
  /* line-height: 12px; */
  top: 0.5rem;
  left: 0.8rem;
  text-shadow: none;
}
</style>

<script setup lang="ts">
import { Speed } from '../const';
import router from '../router';

const clickSlow = () => router.push({
  name: 'Game',
  params: {
    speed: Speed.SLOW,
  },
});
const clickMedium = () => router.push({
  name: 'Game',
  params: {
    speed: Speed.MEDIUM,
  },
});
const clickFast = () => router.push({
  name: 'Game',
  params: {
    speed: Speed.FAST,
  },
});
</script>

<template>
  <div class="home-page">
    <div class="home-page__board">
      <div class="home-page__board__title">
        <h1>贪吃蛇</h1>
      </div>
      <div class="home-page__board__content">
        <div class="home-page__board__content__info">
          <p>选择速度以开始游戏</p>
        </div>
        <div class="home-page__board__content__start">
          <div @click="clickSlow">慢速</div>
          <div @click="clickMedium">中速</div>
          <div @click="clickFast">快速</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &__board {
    width: calc(90vw - 40px);
    max-width: 650px;
    border: solid 5px rgba(0, 0, 0, 0.7);
    text-align: center;
    padding: 20px;

    &__content {
      &__info {
        margin-top: 20px;
      }

      &__start {
        display: flex;
        justify-content: space-evenly;
        margin-top: 20px;

        & > div {
          font-size: 1.5rem;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
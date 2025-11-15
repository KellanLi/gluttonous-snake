<script setup lang="ts">
import { CSSProperties, onMounted, reactive } from 'vue';
import { config } from '../const';
import { PosT } from '../type';

const { initialValue } = config;

const ItemType = Object.freeze({
  EMPTY: 0,
  SNAKE_BODY: 1,
  SNAKE_HEAD: 2,
  FOOD: 3,
});

type ItemTypeT = (typeof ItemType)[keyof typeof ItemType];

/**
 * 用来存储元素类型的矩阵，0为空、1为蛇身、2为蛇头、3为食物
 */
const itemsMatrix = reactive<ItemTypeT[][]>(
  Array(config.height)
    .fill(null)
    .map(() => Array(config.width).fill(ItemType.EMPTY)),
);

const updateMatrix = (pos: PosT, itemType: ItemTypeT) => {
  const [x, y] = pos;
  itemsMatrix[x][y] = itemType;
};

const boardContainerStyle: CSSProperties = {
  gridTemplateColumns: `repeat(${config.width}, 1fr)`,
  gridTemplateRows: `repeat(${config.height}, 1fr)`,
};

onMounted(() => {
  // 挂载时初始化蛇的位置
  updateMatrix(initialValue.snakeHeadPos, ItemType.SNAKE_HEAD);
  initialValue.snakeBodyPos.forEach((pos) =>
    updateMatrix(pos, ItemType.SNAKE_BODY),
  );
});
</script>

<template>
  <div class="board">
    <div class="board__inner">
      <div class="board__item-container" :style="boardContainerStyle">
        <template v-for="(rows, outerIndex) in itemsMatrix">
          <div
            v-for="(value, innerIndex) in rows"
            :key="`${outerIndex}${innerIndex}${value}`"
            class="item"
            :class="{
              'item-snake':
                value === ItemType.SNAKE_BODY || value === ItemType.SNAKE_HEAD,
            }"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.board {
  border: solid 5px rgba(0, 0, 0, 0.7);
  width: 90vw;
  max-width: 690px;
  margin: auto;
  margin-top: 10vh;

  &__inner {
    padding-top: 66.66%;
    position: relative;
  }

  &__item-container {
    display: grid;
    gap: 2px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    .item {
      border-radius: 2px;
    }

    .item-snake {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
}
</style>

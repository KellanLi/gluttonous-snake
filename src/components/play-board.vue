<script setup lang="ts">
import {
  CSSProperties,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { config, Direction, Speed, ItemType } from '../const';
import { PosT, ItemTypeT, DirectionT } from '../type';

const { initialValue } = config;

const boardContainerStyle: CSSProperties = {
  gridTemplateColumns: `repeat(${config.width}, 1fr)`,
  gridTemplateRows: `repeat(${config.height}, 1fr)`,
};

interface SnakeStatusI {
  direction: DirectionT;
  pos: PosT[];
}

const timer = ref<number>();

/**
 * 用来持有蛇移动状态的对象
 */
const snakeStatus = reactive<SnakeStatusI>({
  direction: initialValue.direction,
  pos: initialValue.snakePos,
});

/**
 * 用来存储元素类型的矩阵，0为空、1为蛇身、2为蛇头、3为食物
 */
const itemsMatrix = reactive<ItemTypeT[][]>(
  Array(config.height)
    .fill(null)
    .map(() => Array(config.width).fill(ItemType.EMPTY)),
);

const allMatrixMapIndex = Array(config.height*config.width).fill(null).map((_, index) => index + 1);

const updateMatrix = (pos: PosT, itemType: ItemTypeT) => {
  const [x, y] = pos;
  itemsMatrix[x][y] = itemType;
};

const cleanMatrix = () => {
  for (let i = 0; i < itemsMatrix.length; i++) {
    for (let j = 0; j < itemsMatrix[i].length; j++) {
      itemsMatrix[i][j] = ItemType.EMPTY;
    }
  }
};

const generateFood = () => {
  const mapSnakeIndex = snakeStatus.pos.map(([y, x]) => y * config.width + x);
  const spareMapIndex = allMatrixMapIndex.filter((index) => !mapSnakeIndex.includes(index));
  const randomIndex = Math.floor(Math.random() * spareMapIndex.length);
  const y = Math.floor(spareMapIndex[randomIndex] / config.width);
  const x = spareMapIndex[randomIndex] % config.width;
  updateMatrix([y, x], ItemType.FOOD);
}

const gameOver = (msg: string = '') => {
  if (msg) alert(msg);
  snakeStatus.pos = initialValue.snakePos;
  snakeStatus.direction = initialValue.direction;
  clearInterval(timer.value);
};

watch(() => snakeStatus.pos, (newPos, oldPos) => {
  
  const [ny, nx] = newPos[0];
  if (
    ny < 0 ||
    ny >= itemsMatrix.length ||
    nx < 0 ||
    nx >= itemsMatrix[ny].length
  ) {
    gameOver('蛇触墙');
    return;
  }

  for (let i = 0; i < newPos.slice(1).length; i++) {
    const [by, bx] = newPos.slice(1)[i];
    if (by === ny && bx === nx) {
      gameOver('蛇触碰到自己身体');
      return;
    }
  }

  if (itemsMatrix[ny][nx] === ItemType.FOOD) {
    snakeStatus.pos = [...snakeStatus.pos, oldPos[oldPos.length - 1]];
    generateFood();
  }

  oldPos.forEach((pos) => updateMatrix(pos, ItemType.EMPTY));
  newPos.forEach((pos) => updateMatrix(pos, ItemType.SNAKE));
});

const onGoUp = () => {
  const [hy, hx] = snakeStatus.pos[0];
  const [ny, nx] = snakeStatus.pos[1];
  if (hy - 1 === ny && hx === nx) {
    return;
  }

  snakeStatus.direction = Direction.UP;
};

const onGoLeft = () => {
  const [hy, hx] = snakeStatus.pos[0];
  const [ny, nx] = snakeStatus.pos[1];
  if (hy === ny && hx - 1 === nx) {
    return;
  }

  snakeStatus.direction = Direction.LEFT;
};

const onGoDown = () => {
  const [hy, hx] = snakeStatus.pos[0];
  const [ny, nx] = snakeStatus.pos[1];
  if (hy + 1 === ny && hx === nx) {
    return;
  }
  snakeStatus.direction = Direction.DOWN;
};

const onGoRight = () => {
  const [hy, hx] = snakeStatus.pos[0];
  const [ny, nx] = snakeStatus.pos[1];
  if (hy === ny && hx + 1 === nx) {
    return;
  }
  snakeStatus.direction = Direction.RIGHT;
};

onMounted(() => {
  // 挂载时初始化蛇的位置
  initialValue.snakePos.forEach((pos) => updateMatrix(pos, ItemType.SNAKE));
  generateFood();
  document.addEventListener('keydown', (event) => {
    const EventMap: Record<string, () => void> = {
      w: onGoUp,
      a: onGoLeft,
      s: onGoDown,
      d: onGoRight,
    };

    if (!Object.keys(EventMap).includes(event.key)) return;

    EventMap[event.key]();
  });

  timer.value = setInterval(() => {
    const snakeRestPos = snakeStatus.pos.slice(0, -1);
    const [hy, hx] = snakeStatus.pos[0];
    switch (snakeStatus.direction) {
      case Direction.UP:
        snakeStatus.pos = [[hy - 1, hx], ...snakeRestPos]
        break;
      case Direction.DOWN:
        snakeStatus.pos = [[hy + 1, hx], ...snakeRestPos]
        break;
      case Direction.LEFT:
        snakeStatus.pos = [[hy, hx - 1], ...snakeRestPos]
        break;
      case Direction.RIGHT:
        snakeStatus.pos = [[hy, hx + 1], ...snakeRestPos]
        break;
    }
  }, 600 / Speed.SLOW);
});

onUnmounted(() => {
  gameOver();
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
              'item-snake': value === ItemType.SNAKE,
              'item-food': value === ItemType.FOOD
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

    .item-food {
      background-color: rgba(255, 0, 0, 0.7);
    }
  }
}
</style>

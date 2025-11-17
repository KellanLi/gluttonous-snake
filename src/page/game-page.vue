<script setup lang="ts">
import {
  computed,
  CSSProperties,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { config, Direction, ItemType, GameState } from '../const';
import { PosT, ItemTypeT, DirectionT, GetEnumType } from '../type';
import router from '../router';

const params = router.currentRoute.value.params;
const speed = Number(params.speed);

const { initialValue } = config;

const boardContainerStyle: CSSProperties = {
  gridTemplateColumns: `repeat(${config.width}, 1fr)`,
  gridTemplateRows: `repeat(${config.height}, 1fr)`,
};

interface SnakeStatusI {
  direction: DirectionT;
  pos: PosT[];
}

interface DialogProps {
  title: string;
  content?: string;
  btns: {
    text: string;
    onClick: () => void;
  }[];
}

const gameStatus = ref<GetEnumType<typeof GameState>>(GameState.PLAYING);
const timer = ref<number>();
const showDialog = computed(() => {
  const showDialogStatus: GetEnumType<typeof GameState>[] = [
    GameState.GAME_OVER,
    GameState.PAUSE,
  ];
  return showDialogStatus.includes(gameStatus.value);
});

const dialogProps = ref<DialogProps>({
  title: '游戏结束',
  content: '',
  btns: [],
});

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

const allMatrixMapIndex = Array(config.height * config.width)
  .fill(null)
  .map((_, index) => index + 1);

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
  const spareMapIndex = allMatrixMapIndex.filter(
    (index) => !mapSnakeIndex.includes(index),
  );
  const randomIndex = Math.floor(Math.random() * spareMapIndex.length);
  const y = Math.floor(spareMapIndex[randomIndex] / config.width);
  const x = spareMapIndex[randomIndex] % config.width;
  updateMatrix([y, x], ItemType.FOOD);
};

const initBoard = () => {
  cleanMatrix();
  snakeStatus.pos = initialValue.snakePos;
  snakeStatus.direction = initialValue.direction;
  generateFood();
};

const gameOver = (msg: string = '') => {
  gameStatus.value = GameState.GAME_OVER;
  dialogProps.value = {
    title: '游戏结束',
    content: msg,
    btns: [
      {
        text: '重新开始',
        onClick: () => {
          gameStatus.value = GameState.PLAYING;
          initBoard();
          startGame();
        },
      },
      {
        text: '回到首页',
        onClick: () => {
          router.push('/');
        },
      },
    ],
  };
  clearInterval(timer.value);
};

watch(
  () => snakeStatus.pos,
  (newPos, oldPos) => {
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

    try {
      oldPos.forEach((pos) => updateMatrix(pos, ItemType.EMPTY));
      newPos.forEach((pos) => updateMatrix(pos, ItemType.SNAKE));
    } catch (error) {
      console.log('pos', oldPos, newPos);
      console.log(error);
    }
  },
);

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

const pauseGame = () => {
  gameStatus.value = GameState.PAUSE;

  dialogProps.value = {
    title: '游戏暂停',
    content: '',
    btns: [
      {
        text: '继续',
        onClick: () => {
          startGame();
        },
      },
      {
        text: '回到首页',
        onClick: () => {
          router.push('/');
        },
      },
    ],
  };

  clearInterval(timer.value);
};

const startGame = () => {
  gameStatus.value = GameState.PLAYING;
  clearInterval(timer.value);
  timer.value = setInterval(() => {
    const snakeRestPos = snakeStatus.pos.slice(0, -1);
    const [hy, hx] = snakeStatus.pos[0];
    switch (snakeStatus.direction) {
      case Direction.UP:
        snakeStatus.pos = [[hy - 1, hx], ...snakeRestPos];
        break;
      case Direction.DOWN:
        snakeStatus.pos = [[hy + 1, hx], ...snakeRestPos];
        break;
      case Direction.LEFT:
        snakeStatus.pos = [[hy, hx - 1], ...snakeRestPos];
        break;
      case Direction.RIGHT:
        snakeStatus.pos = [[hy, hx + 1], ...snakeRestPos];
        break;
    }
  }, 600 / speed);
};

const onKeydown = (event: KeyboardEvent) => {
  const EventMap: Record<string, () => void> = {
    w: onGoUp,
    a: onGoLeft,
    s: onGoDown,
    d: onGoRight,
  };

  if (!Object.keys(EventMap).includes(event.key)) return;

  EventMap[event.key]();
};

let startX = 0;
let startY = 0;

const onTouchstart = (ev: TouchEvent) => {
  ev.preventDefault();
  startX = ev.touches[0].clientX;
  startY = ev.touches[0].clientY;
};

const onTouchend = (ev: TouchEvent) => {
  ev.preventDefault();
  const endX = ev.changedTouches[0].clientX;
  const endY = ev.changedTouches[0].clientY;
  const diffX = endX - startX;
  const diffY = endY - startY;
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      onGoRight();
    } else {
      onGoLeft();
    }
  } else {
    if (diffY > 0) {
      onGoDown();
    } else {
      onGoUp();
    }
  }
};

onMounted(() => {
  generateFood();
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('touchstart', onTouchstart);
  document.addEventListener('touchend', onTouchend);

  startGame();
});

onUnmounted(() => {
  clearInterval(timer.value);
  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('touchstart', onTouchstart);
  document.removeEventListener('touchend', onTouchend);
});
</script>

<template>
  <div class="board" @click="pauseGame" @touchstart="pauseGame">
    <div class="board__inner">
      <div class="board__item-container" :style="boardContainerStyle">
        <template v-for="(rows, outerIndex) in itemsMatrix">
          <div
            v-for="(value, innerIndex) in rows"
            :key="`${outerIndex}${innerIndex}${value}`"
            class="item"
            :class="{
              'item-snake': value === ItemType.SNAKE,
              'item-food': value === ItemType.FOOD,
            }"
          />
        </template>
      </div>
    </div>
  </div>
  <div class="dialog" v-if="showDialog">
    <div class="dialog__mask" />
    <div class="dialog__body">
      <div class="dialog__body__title">{{ dialogProps.title }}</div>
      <div class="dialog__body__content">{{ dialogProps.content }}</div>
      <div class="dialog__body__btns">
        <template v-for="btn in dialogProps.btns" :key="btn.text">
          <div class="dialog__btn" @click="btn.onClick" @touchend="btn.onClick">{{ btn.text }}</div>
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

.dialog {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;

  &__mask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
  }

  &__body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 690px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    z-index: 1001;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    &__content {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }

    &__btns {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
      margin-top: 20px;

      .primary {
        background-color: #333;
        color: #fff;
      }

      .default {
        background-color: #fff;
        color: #333;
      }

      .dialog__btn {
        padding: 1px 15px;
        background-color: #fff;
        color: #333;
        border-radius: 10px;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
      }
    }
  }
}
</style>

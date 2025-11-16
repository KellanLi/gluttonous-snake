import { PosT } from './type';

/** 面板元素类型 */
export const ItemType = Object.freeze({
  EMPTY: 0,
  SNAKE: 1,
  FOOD: 2,
});

/** 蛇移动的速度 */
export const Speed = Object.freeze({
  SLOW: 1,
  MEDIUM: 2,
  FAST: 3,
});

/** 蛇的移动方向 */
export const Direction = Object.freeze({
  UP: 0,
  LEFT: 1,
  DOWN: 2,
  RIGHT: 3,
});

export const config = {
  /** 区域的宽度：30格 */
  width: 31,
  /** 区域的高度：20格 */
  height: 20,
  /** 初始值 */
  initialValue: {
    snakePos: [
      [4, 15],
      [3, 15],
      [2, 15],
    ] as PosT[],
    // speed: Speed.SLOW
    direction: Direction.DOWN,
  },
};

import { PosT } from './type';

export const config = {
  /** 蛇移动的速度 */
  speed: {
    slow: 1,
    medium: 2,
    fast: 3,
  },
  /** 区域的宽度：30格 */
  width: 31,
  /** 区域的高度：20格 */
  height: 20,
  /** 初始值 */
  initialValue: {
    snakeHeadPos: [4, 15] as PosT,
    snakeBodyPos: [
      [2, 15],
      [3, 15],
    ] as PosT[],
  },
};

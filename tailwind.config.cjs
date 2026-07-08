/**
 * Tailwind CSS ビルド設定
 * 旧: cdn.tailwindcss.com + layout.ts内のインラインconfig（実行時生成）
 * 新: ビルド時に public/static/tailwind.css を生成（高速・警告なし）
 *
 * カラートークンは src/components/layout.ts のインラインconfigから移設。
 * future / ai 系は旧AIテーマの互換トークンで、値はカフェ系に統一済み。
 */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cafe: {
          ivory: '#FAF8F3',
          cream: '#F5F0E6',
          beige: '#E8DCC8',
          sand: '#DED3C2',
          latte: '#D4C4A8',
          caramel: '#C4A574',
          wood: '#B8956A',
          brown: '#8B7355',
          espresso: '#5D4E3A',
          dark: '#3D3428',
          text: '#4A4035',
          textLight: '#7A7265'
        },
        nature: {
          mint: '#D4E5D0',
          sage: '#B8CDB0',
          green: '#8FB585',
          forest: '#6B9B62',
          sky: '#D4E8E8',
          aqua: '#B8D8D8',
          blue: '#8BBCBC'
        },
        future: {
          text: '#4A4035',
          textLight: '#7A7265',
          light: '#FAF8F3',
          sky: '#E8DCC8'
        },
        ai: {
          blue: '#6B9B62',
          cyan: '#8BBCBC',
          purple: '#B8956A',
          pink: '#C97B5D'
        }
      }
    }
  },
  plugins: []
}

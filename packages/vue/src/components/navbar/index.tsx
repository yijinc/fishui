import { defineComponent, CSSProperties } from 'vue';
import Taro from '@tarojs/taro';
import { getSizeToPx } from '../../utils';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#222222',
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF',
    },
    fixed: {
      type: Boolean,
      default: true,
    },
    // height = 0 时作 StatusBar 占位符使用
    height: {
      type: [String, Number],
      default: 44,
    },
    goback: Function,
    hideBack: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const { statusBarHeight } = Taro.getSystemInfoSync();
    const fixedClass = props.fixed ? 'fish-navbar__fixed' : '';
    const statusBarStyle: CSSProperties = {
      height: `${statusBarHeight}px`,
    };
    const height = getSizeToPx(props.height);

    const handleBack = (e) => {
      if (typeof props.goback === 'function') {
        props.goback(e);
      } else {
        Taro.navigateBack();
      }
    };

    return () => (
      <view className='fish-navbar'>
        <view className={fixedClass} style={{ backgroundColor: props.backgroundColor }}>
          <view style={statusBarStyle} />
          {
            height !== 0 && (
              <view className='fish-navbar__header' style={{ height, backgroundColor: props.backgroundColor }}>
                {
                  !props.hideBack && (
                    <view className='fish-navbar__header-left'>
                      {
                        !slots.left ? (
                          <view className='fish-navbar__goback' onTouchstart={handleBack}>
                            <image
                              // eslint-disable-next-line max-len
                              src='https://panshi-on.oss-cn-hangzhou.aliyuncs.com/yunxiaoding-mini/system/assets/images/JFEMBCAF-1666323574944icon-back-black.png'
                              className='fish-navbar__icon'
                            />
                          </view>
                        ) : slots.left()
                      }
                    </view>
                  )
                }
                <view className='fish-navbar__header-wrap'>
                  {
                    !slots.title ? <text style={{ color: props.color }}>{props.title}</text> : slots.title()
                  }
                </view>
              </view>
            )
          }
        </view>

        <view className='fish-navbar__placeholder'>
          <view style={statusBarStyle} />
          <view style={{ height }} />
        </view>
      </view>
    );
  }
});
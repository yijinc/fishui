import * as React from 'react';
import Taro from '@tarojs/taro';
import { Image, View, Text } from '@tarojs/components';
import { getSizeToPx } from '../../utils';
import iconPath from '../../../../../assets/icon-back.png';

type INavbarProps = React.PropsWithChildren<{
  title?: string;
  backIcon?: string;
  color?: string;
  backgroundColor?: string;
  fixed?: boolean;
  height?: number;
  hideBack?: boolean;
  goback?: (e: any) => void;
  renderLeft?: () => React.ReactNode;
  renderTitle?: () => React.ReactNode;
}>;

const { statusBarHeight } = Taro.getSystemInfoSync();

const Navbar: React.FC<INavbarProps> = (props) => {
  const fixedClass = props.fixed ? 'fish-navbar__fixed' : '';
  const statusBarStyle: React.CSSProperties = {
    height: `${statusBarHeight}px`,
  };
  const height = getSizeToPx(props.height!);

  const handleBack = (e) => {
    if (typeof props.goback === 'function') {
      props.goback(e);
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View className='fish-navbar'>
      <View className={fixedClass} style={{ backgroundColor: props.backgroundColor }}>
        <View style={statusBarStyle} />
        {
          height !== 0 && (
            <View className='fish-navbar__header' style={{ height, backgroundColor: props.backgroundColor }}>
              {
                !props.hideBack && (
                  <View className='fish-navbar__header-left'>
                    {
                      !props.renderLeft ? (
                        <View className='fish-navbar__goback' onTouchstart={handleBack}>
                          <Image
                            src={props.backIcon}
                            className='fish-navbar__icon'
                          />
                        </View>
                      ) : props.renderLeft()
                    }
                  </View>
                )
              }
              <View className='fish-navbar__header-wrap'>
                {
                  !props.renderTitle ? <Text style={{ color: props.color }}>{props.title}</Text> : props.renderTitle()
                }
              </View>
            </View>
          )
        }
      </View>

      <View className='fish-navbar__placeholder'>
        <View style={statusBarStyle} />
        <View style={{ height }} />
      </View>
    </View>
  )
};

Navbar.defaultProps = {
  title: '',
  color: '#222222',
  backgroundColor: '#FFFFFF',
  fixed: true,
  height: 44,
  hideBack: false,
  backIcon: iconPath,
}

export default Navbar;

export type {
  INavbarProps
}

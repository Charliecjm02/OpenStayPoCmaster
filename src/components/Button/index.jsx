import React from 'react';
import style from './style.module.scss';
import cn from 'classnames';

export const Button = ({ children, type = 'outline', ...props }) => {
  return (
    <button
      className={cn(style.base, {
        [style.filled]: type === 'filled',
      })}
      {...props}
    >
      {children}
    </button>
  );
};

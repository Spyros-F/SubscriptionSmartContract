import React from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import styles from './styles'

const AsyncButton = props => {
  const {
    children,
    loading,
    className,
    variant,
    onClick,
    disabled,
    fullWidth,
    color,
    path,
    size
  } = props

  const classes = styles();

  return (
    <div className={`${classes.root} ${fullWidth ? classes.fullWidth : ''}`}>
      <Button
        variant={variant}
        disabled={loading || disabled}
        onClick={onClick}
        className={className}
        fullWidth={fullWidth}
        color={color}
        classes={{contained: classes.btn}}
        size={size}
      >
        {children}
      </Button>
      {loading && <CircularProgress size={24} className={classes.btnProgress} />}
    </div>
  )
}

export default React.memo(AsyncButton)
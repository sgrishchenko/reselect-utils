import React, {
  FunctionComponent,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useColorMode } from 'theme-ui';

export type TypedocFrameProps = {
  title: string;
  route: string;
};

export const TypedocFrame: FunctionComponent<TypedocFrameProps> = ({
  title,
  route,
}) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState();
  const [colorMode] = useColorMode();

  const style = {
    border: 'none',
    width: '100%',
    height,
  };

  const onContentWindowResize = useCallback(() => {
    setHeight(iframe.current?.contentDocument?.body.scrollHeight);
  }, [iframe, setHeight]);

  useEffect(() => {
    const contentWindow = iframe.current?.contentWindow;

    if (contentWindow) {
      contentWindow.addEventListener('resize', onContentWindowResize);

      return () => {
        contentWindow.removeEventListener('resize', onContentWindowResize);
      };
    }

    return () => undefined;
  }, [iframe, onContentWindowResize]);

  return (
    <iframe
      ref={iframe}
      title={title}
      style={style}
      src={`https://sgrishchenko.github.io/reselect-utils/typedoc/${colorMode}/${route}`}
      onLoad={() => onContentWindowResize()}
    />
  );
};

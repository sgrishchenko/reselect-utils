import React, {
  FunctionComponent,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useColorMode } from 'theme-ui';
import { useMedia } from 'use-media';
import { ExternalLink } from '../ExternalLink';

export type TypedocFrameProps = {
  title: string;
  route: string;
};

export const TypedocFrame: FunctionComponent<TypedocFrameProps> = ({
  title,
  route,
}) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();
  const isMobile = useMedia({ maxWidth: `${920 / 16}em` });
  const [colorMode] = useColorMode();

  const source = `https://sgrishchenko.github.io/reselect-utils/typedoc/${colorMode}/${route}`;

  const styles = {
    frame: {
      border: 'none',
      width: '100%',
      height,
      marginTop: isMobile ? 50 : 0,
    },
  };

  const onContentWindowResize = useCallback(() => {
    setHeight(iframe.current?.contentDocument?.body.scrollHeight);
  }, [iframe, setHeight]);

  useEffect(() => {
    const contentWindow = iframe.current?.contentWindow;

    if (contentWindow) {
      try {
        contentWindow.addEventListener('resize', onContentWindowResize);
      } catch {
        // do nothing
      }

      return () => {
        try {
          contentWindow.removeEventListener('resize', onContentWindowResize);
        } catch {
          // do nothing
        }
      };
    }

    return () => undefined;
  }, [iframe, onContentWindowResize]);

  return (
    <>
      <ExternalLink
        source={source}
        top={isMobile ? 15 : 50}
        right={isMobile ? 30 : 40}
      />
      <iframe
        ref={iframe}
        title={title}
        style={styles.frame}
        src={source}
        onLoad={() => onContentWindowResize()}
      />
    </>
  );
};

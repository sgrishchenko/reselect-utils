import React, {
  FunctionComponent,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useColorMode } from 'theme-ui';
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
  const [height, setHeight] = useState();
  const [colorMode] = useColorMode();

  const source = `https://sgrishchenko.github.io/reselect-utils/typedoc/${colorMode}/${route}`;

  const styles = {
    frame: {
      border: 'none',
      width: '100%',
      height,
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

  // TODO: Remove it when MainContainer shadowing will be supported in docz
  useEffect(() => {
    const globalCSS = `
      [data-testid = main-container] {
        padding: 0;
        max-width: 100%;
      }
    `;

    const globalStyle = document.createElement('style');
    globalStyle.innerHTML = globalCSS;

    document.body.appendChild(globalStyle);

    return () => {
      document.body.removeChild(globalStyle);
    };
  }, []);

  return (
    <>
      <ExternalLink source={source} top={50} right={40} />
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

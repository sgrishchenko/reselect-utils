import React, {
  FunctionComponent,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useColorMode, useThemeUI } from 'theme-ui';
import { ExternalLink } from 'react-feather';

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
  const { theme } = useThemeUI();

  const source = `https://sgrishchenko.github.io/reselect-utils/typedoc/${colorMode}/${route}`;

  const styles = {
    link: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute' as const,
      top: 50,
      right: 40,
      backgroundColor: 'transparent',
      color: theme?.colors?.muted,
      fontSize: theme?.fontSizes?.[1] as number,
      textDecoration: 'none',
    },
    linkTitle: {
      paddingLeft: theme?.space?.[2] as number,
    },
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
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.link}
      >
        <ExternalLink width={14} />
        <div style={styles.linkTitle}>View in full screen</div>
      </a>
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

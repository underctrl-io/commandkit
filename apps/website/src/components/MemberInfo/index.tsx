// borrowed from https://github.com/vendure-ecommerce/vendure/blob/cfc0dd7c34fd070a15455508f32d37e94589e656/docs/src/components/MemberInfo/index.tsx
import React from 'react';
import styles from './styles.module.css';

export default function MemberInfo(props: {
  kind: string;
  since?: string;
  experimental?: boolean;
  type: string;
  default?: string;
}) {
  return (
    <div className={styles.memberInfo}>
      <div className="badge badge--primary">
        <div>{props.kind}</div>
      </div>

      {props.since && (
        <div
          className="badge badge--warning"
          title={`This API was added in v${props.since}`}
        >
          <div className="text-yellow-700">v{props.since}</div>
        </div>
      )}
      {props.experimental && (
        <div
          className="badge badge--info"
          title="This API is experimental and may change in a future release"
        >
          <div className="text-yellow-700">experimental</div>
        </div>
      )}
      <div className={styles.type}>
        <code
          dangerouslySetInnerHTML={{ __html: props.type }}
          className="padding-horiz--sm"
        ></code>
      </div>
      {props.default && (
        <div className={styles.default}>
          <div className="label">default:</div>
          <code
            dangerouslySetInnerHTML={{ __html: props.default }}
            className="margin-horiz--sm padding-horiz--sm"
          ></code>
        </div>
      )}
    </div>
  );
}

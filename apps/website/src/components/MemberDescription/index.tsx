// borrowed from https://github.com/vendure-ecommerce/vendure/blob/cfc0dd7c34fd070a15455508f32d37e94589e656/docs/src/components/MemberDescription/index.tsx
import React from 'react';

export default function MemberInfo(props: { description: string }) {
  return <div className="member-description">{props.description}</div>;
}

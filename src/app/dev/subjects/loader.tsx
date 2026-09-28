"use client";

import dynamic from "next/dynamic";

const Switchboard = dynamic(() => import("./preview"), { ssr: false });

export default function SubjectsSwitchboardLoader() {
  return <Switchboard />;
}

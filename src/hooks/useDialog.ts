import { useEffect, useRef, type SyntheticEvent } from 'react';
/** Native modal dialogs provide focus containment, Escape dismissal and background inertness. */
export function useDialog(open:boolean,onClose:()=>void){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const dialog=ref.current;if(!dialog)return;
  if(open && !dialog.open)dialog.showModal();
  if(!open && dialog.open)dialog.close();
  return ()=>{if(dialog.open)dialog.close();};
 },[open]);
 return {ref,onCancel:(event:SyntheticEvent)=>{event.preventDefault();onClose();}};
}

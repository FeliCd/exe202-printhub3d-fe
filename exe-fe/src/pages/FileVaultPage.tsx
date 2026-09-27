import { useRef } from 'react';
import { useRemote,useAction } from '../hooks/useRemote';
import { send } from '../services/api';
import { uploadFile, downloadFile, type FileDTO } from '../services/fileVaultService';
import { Panel,Card,Notice,RemoteState,button,secondary } from '../components/DataUI';
export default function FileVaultPage(){const remote=useRemote<FileDTO[]>('/vault/files');const action=useAction(remote.reload);const file=useRef<HTMLInputElement>(null);
return <Panel title="Kho thiết kế của tôi"><Notice error={action.error}/><input ref={file} type="file" accept=".stl,.obj,.step,.stp" aria-label="Chọn thiết kế"/><button className={button} disabled={action.busy} onClick={()=>void action.run(async()=>{if(!file.current?.files?.[0])throw new Error('Vui lòng chọn tệp.');await uploadFile(file.current.files[0]);file.current.value='';})}>Tải lên</button>
<RemoteState {...remote} empty={!remote.data?.length} retry={remote.reload}/>{remote.data?.map(f=><Card key={f.id}><h2>{f.fileName}</h2><p>{(f.sizeBytes/1024/1024).toFixed(2)} MB · {new Date(f.createdAt).toLocaleString('vi-VN')}</p><div className="flex gap-2 flex-wrap">
<button className={secondary} disabled={action.busy} onClick={()=>void action.run(()=>downloadFile(`/vault/files/${f.id}/download`,f.fileName))}>Tải về</button>
<button className={button} disabled={action.busy} onClick={()=>void action.run(async()=>{const requirements=prompt('Yêu cầu vật liệu, màu, số lượng và thông số in:');if(!requirements)return;const shippingAddress=prompt('Người nhận, điện thoại, địa chỉ giao:');if(!shippingAddress)return;await send('/custom-orders',{fileId:f.id,requirements,shippingAddress,quantity:1});alert('Đã gửi yêu cầu. Xem tại Báo giá.');})}>Yêu cầu in lại</button>
<button className={secondary} disabled={action.busy} onClick={()=>{if(confirm('Xóa tệp này khỏi kho?'))void action.run(()=>send(`/vault/files/${f.id}`,undefined,'delete'));}}>Xóa</button></div></Card>)}</Panel>;}

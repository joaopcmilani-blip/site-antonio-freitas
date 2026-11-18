import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.10';
import * as tus from 'https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/+esm';
const db=createClient('https://lydznydmkcwqtxukktyy.supabase.co','sb_publishable_jJ98f2Xpok2CrjJ4KfRFmA_ahQaWfAv');
const bucket='antonio-freitas-videos', $=id=>document.getElementById(id), msg=t=>$('video-progress').textContent=t;
const publicUrl=path=>db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
function createTitleEditor(video, heading) {
  const edit = document.createElement('button');
  edit.type = 'button';
  edit.textContent = '✎';
  edit.title = 'Editar título do vídeo';
  edit.setAttribute('aria-label', edit.title);
  edit.setAttribute('aria-expanded', 'false');

  const form = document.createElement('form');
  form.hidden = true;
  const label = document.createElement('label');
  label.textContent = 'Título do vídeo';
  const input = document.createElement('input');
  input.required = true;
  label.append(input);

  const save = document.createElement('button');
  save.type = 'submit';
  save.textContent = 'Salvar título';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancelar';
  const feedback = document.createElement('p');
  feedback.setAttribute('role', 'status');
  form.append(label, save, cancel, feedback);

  function closeEditor() {
    form.hidden = true;
    edit.setAttribute('aria-expanded', 'false');
    edit.focus();
  }

  edit.onclick = () => {
    if (!form.hidden) {
      closeEditor();
      return;
    }
    input.value = video.titulo;
    feedback.textContent = '';
    form.hidden = false;
    edit.setAttribute('aria-expanded', 'true');
    input.focus();
    input.select();
  };
  cancel.onclick = closeEditor;
  input.oninput = () => input.setCustomValidity('');
  form.onsubmit = async event => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
      input.setCustomValidity('Informe o título do vídeo.');
      input.reportValidity();
      return;
    }
    if (title === video.titulo) {
      closeEditor();
      return;
    }

    edit.disabled = input.disabled = save.disabled = cancel.disabled = true;
    feedback.textContent = 'Salvando título...';
    try {
      const { error } = await db.from('antonio_freitas_videos')
        .update({ titulo: title }).eq('id', video.id).select('id').single();
      if (error) throw error;
      video.titulo = title;
      heading.textContent = title + (video.destaque ? ' ⭐ Vídeo principal' : '');
      msg('Título do vídeo atualizado.');
      edit.disabled = false;
      closeEditor();
    } catch (error) {
      feedback.textContent = 'Erro ao salvar o título: ' + error.message;
    } finally {
      edit.disabled = input.disabled = save.disabled = cancel.disabled = false;
    }
  };

  return [edit, form];
}

async function load(){const {data,error}=await db.from('antonio_freitas_videos').select('*').order('criado_em',{ascending:false});if(error){msg(error.message);return}const list=$('videos-list');list.replaceChildren();for(const v of data||[]){const item=document.createElement('article'),heading=document.createElement('h3'),video=document.createElement('video'),main=document.createElement('button'),del=document.createElement('button');heading.textContent=v.titulo+(v.destaque?' ⭐ Vídeo principal':'');video.src=publicUrl(v.arquivo_path);video.controls=true;video.preload='none';video.style.cssText='display:block;max-width:240px;width:100%;margin:10px 0';main.textContent=v.destaque?'Vídeo principal':'Definir como principal';main.disabled=v.destaque;main.onclick=async()=>{msg('Atualizando vídeo principal...');const {error:e1}=await db.from('antonio_freitas_videos').update({destaque:false}).eq('destaque',true);if(e1){msg(e1.message);return}const {error:e2}=await db.from('antonio_freitas_videos').update({destaque:true}).eq('id',v.id);msg(e2?e2.message:'Vídeo principal atualizado');load()};del.textContent='Excluir vídeo';del.onclick=async()=>{if(!confirm('Excluir este vídeo permanentemente?'))return;const {error}=await db.storage.from(bucket).remove([v.arquivo_path]);if(error){msg('Erro ao excluir arquivo: '+error.message);return}const result=await db.from('antonio_freitas_videos').delete().eq('id',v.id);msg(result.error?result.error.message:'Vídeo excluído');load()};const [edit,editor]=createTitleEditor(v,heading);item.append(heading,video,main,edit,del,editor);list.append(item)}}
$('video-form').onsubmit=async e=>{e.preventDefault();const file=$('video-file').files[0],title=$('video-title').value.trim();if(!file||!title)return;if(!['video/mp4','video/webm'].includes(file.type)){msg('Escolha um vídeo MP4 ou WEBM.');return}if(file.size>50*1024*1024){msg('Este vídeo ultrapassa 50 MB. Comprima-o antes de enviar.');return}const {data:{session}}=await db.auth.getSession();if(!session){msg('Faça login novamente.');return}const ext=file.type==='video/webm'?'webm':'mp4',path=crypto.randomUUID()+'.'+ext;const button=$('video-submit');button.disabled=true;msg('Iniciando envio...');try{await new Promise((resolve,reject)=>{const upload=new tus.Upload(file,{endpoint:'https://lydznydmkcwqtxukktyy.storage.supabase.co/storage/v1/upload/resumable',retryDelays:[0,3000,5000,10000],headers:{authorization:'Bearer '+session.access_token,apikey:'sb_publishable_jJ98f2Xpok2CrjJ4KfRFmA_ahQaWfAv'},uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,metadata:{bucketName:bucket,objectName:path,contentType:file.type,cacheControl:'3600'},chunkSize:6*1024*1024,onError:reject,onProgress:(sent,total)=>msg('Enviando vídeo: '+Math.round(sent/total*100)+'%'),onSuccess:resolve});upload.start()});const {data:existing}=await db.from('antonio_freitas_videos').select('id').eq('destaque',true).limit(1);const {error}=await db.from('antonio_freitas_videos').insert({titulo:title,arquivo_path:path,destaque:!existing?.length});if(error)throw error;msg('Vídeo enviado com sucesso!');$('video-form').reset();load()}catch(error){msg('Erro no envio: '+(error.message||error))}finally{button.disabled=false}};
load();

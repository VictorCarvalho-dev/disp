"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Image as ImageIcon, Video as VideoIcon, File as FileIcon, FileAudio, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { sendFile } from "@/app/_server-actions/shots";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

const getFileType = (mime) => {
  if (!mime) return 'file';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  return 'document';
};

function randomPick(arr) {
  return arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : "";
}
function parseTemplate(template, mediaFiles = {}) {
  console.log("[parseTemplate] Input template:", template);
  console.log("[parseTemplate] Media files:", mediaFiles);

  let img = mediaFiles.images || [];
  let video = mediaFiles.videos || [];
  let audio = mediaFiles.audios || [];
  let doc = mediaFiles.documents || [];

  console.log("[parseTemplate] Available media counts:", {
    images: img.length,
    videos: video.length,
    audios: audio.length,
    documents: doc.length
  });

  let blocks = template.split("{{quebra}}");
  console.log("[parseTemplate] Blocks after split:", blocks);
  let result = [];

  for (let block of blocks) {
    block = block.trim();
    console.log("[parseTemplate] Processing block:", block);
    if (!block) continue;

    if (block.startsWith("{{imagem")) {
      console.log("[parseTemplate] Found image block");
      let matchAlt = block.match(/alt="([^"]*)"/);
      const selectedImage = randomPick(img);
      console.log("[parseTemplate] Selected image:", selectedImage ? "Found" : "None");
      result.push({
        type: "image",
        msg: matchAlt ? matchAlt[1] : "",
        mimetype: "image/png",
        base64: selectedImage
      });

    } else if (block.startsWith("{{video")) {
      console.log("[parseTemplate] Found video block");
      let matchAlt = block.match(/alt="([^"]*)"/);
      const selectedVideo = randomPick(video);
      result.push({
        type: "video",
        msg: matchAlt ? matchAlt[1] : "",
        mimetype: "video/mp4",
        base64: selectedVideo
      });

    } else if (block.startsWith("{{audio")) {
      console.log("[parseTemplate] Found audio block");
      let matchAlt = block.match(/alt="([^"]*)"/);
      const selectedAudio = randomPick(audio);
      result.push({
        type: "audio",
        msg: matchAlt ? matchAlt[1] : "",
        mimetype: "audio/mpeg",
        base64: selectedAudio
      });

    } else if (block.startsWith("{{doc")) {
      console.log("[parseTemplate] Found document block");
      let matchAlt = block.match(/alt="([^"]*)"/);
      const selectedDoc = randomPick(doc);
      result.push({
        type: "document",
        msg: matchAlt ? matchAlt[1] : "",
        mimetype: "application/pdf",
        base64: selectedDoc
      });

    } else {
      console.log("[parseTemplate] Found text block");
      result.push({
        type: "text",
        msg: block
      });
    }
  }

  console.log("[parseTemplate] Final result:", result);
  return result;
}

function WhatsAppPreviewModal({ open, onClose, stepContent = [], stepIndex = 0 }) {
  if (!open) return null;

  const SmartImg = ({ src, alt, className }) => {
    const [finalSrc, setFinalSrc] = useState(src);

    useEffect(() => {
      let revoked;
      if (!src) return;
      if (src.startsWith('data:') || src.startsWith('blob:')) {
        setFinalSrc(src);
        return;
      }
      (async () => {
        try {
          const res = await fetch(src, { credentials: 'include' });
          if (!res.ok) throw new Error('fetch failed');
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          setFinalSrc(objUrl);
          revoked = objUrl;
        } catch (e) {
          setFinalSrc(src);
        }
      })();
      return () => {
        if (revoked && revoked.startsWith('blob:')) URL.revokeObjectURL(revoked);
      };
    }, [src]);

    return <Image src={finalSrc} alt={alt} className={`w-[200px] h-auto ${className}`} sizes="100vw" width={0} height={0} />;
  };

  const renderBubble = (item, idx) => {
    if (item.type === 'text') {
      return (
        <div key={idx} className="max-w-[80%] self-end bg-[#E7FFDB] text-[#222] px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm whitespace-pre-wrap break-words">
          {item.msg}
        </div>
      );
    }
    if (item.type === 'image' && (item.previewUrl || item.fileUrl || item.base64)) {
      const src = item.previewUrl || item.fileUrl || item.base64;
      return (
        <div key={idx} className="max-w-[80%] self-end bg-[#E7FFDB] p-1 rounded-2xl rounded-tr-sm shadow-sm overflow-hidden">
          <SmartImg src={src} alt={item.caption || 'Imagem'} className="w-full h-auto rounded-lg" />
          {item.caption && <div className="px-2 py-1 text-sm text-gray-700">{item.caption}</div>}
        </div>
      );
    }
    if (item.type === 'video' && (item.previewUrl || item.fileUrl)) {
      return (
        <div key={idx} className="max-w-[80%] self-end bg-[#E7FFDB] p-1 rounded-2xl rounded-tr-sm shadow-sm overflow-hidden">
          <video src={item.previewUrl || item.fileUrl} controls className="w-full rounded-lg" />
          {item.caption && <div className="px-2 py-1 text-sm text-gray-700">{item.caption}</div>}
        </div>
      );
    }
    if (item.type === 'audio' && (item.previewUrl || item.fileUrl)) {
      return (
        <div key={idx} className="max-w-[80%] self-end bg-[#E7FFDB] p-2 rounded-2xl rounded-tr-sm shadow-sm">
          <div className="text-xs text-gray-600 mb-1">Áudio</div>
          <audio src={item.previewUrl || item.fileUrl} controls className="w-full" />
        </div>
      );
    }
    if (item.type === 'document') {
      return (
        <div key={idx} className="max-w-[80%] self-end bg-[#E7FFDB] px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm text-sm text-gray-800 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" />
          {item.msg || 'Documento'}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogTitle>

      </DialogTitle>
      <DialogContent className="p-0 bg-transparent border-none shadow-none w-auto max-w-none">
        <div className="relative w-[360px] h-[720px] bg-black rounded-[36px] shadow-2xl border-8 border-black overflow-hidden">
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 bg-black w-40 h-6 rounded-b-3xl z-[50]" />
          <div className="relative bg-[#075E54] text-white pt-3 h-20 border-b-2 border-[#064d44] px-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-full" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Prévia • Variação {stepIndex + 1}</div>
              <div className="text-[10px] text-white/80">WhatsApp</div>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white text-sm"
            >
              Fechar
            </button>
          </div>
          <div className="absolute inset-0 top-[80px] bottom-[0] bg-[url('/whatsapp-chat-bg.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-[rgba(229,221,213,0.25)]" />
            <div className="relative h-full overflow-y-auto p-3 flex flex-col gap-2">
              {stepContent && stepContent.length > 0 ? (
                stepContent.map((item, idx) => (
                  <div key={idx} className="w-full flex flex-col items-end">
                    {renderBubble(item, idx)}
                    <div className="text-[10px] text-gray-300 mt-0.5 mr-1">12:34</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-600 text-center mt-6">Sem conteúdo para prévia</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MessageEditor({ onSave, onCancel, connections = [], contacts = [], isLoading = false }) {
  const [messages, setMessages] = useState([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [variables, setVariables] = useState([]);
  const [formData, setFormData] = useState(() => ({
    contactListId: "",
    connectionsSelect: [],
    config: {
      delayFrom: 1,
      delayTo: 5,

      blockFrom: 15,
      blockTo: 15,

      delayBlockFrom: 0,
      delayBlockTo: 0,
      start: "immediate",
      startTime: "00:00",
      endTime: "00:00",
      period: []
    }
  }));
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);

  const fileInputRef = useRef({
    image: null,
    video: null,
    document: null,
    audio: null
  });

  const days = [
    { id: 'monday', label: 'Seg' },
    { id: 'tuesday', label: 'Ter' },
    { id: 'wednesday', label: 'Qua' },
    { id: 'thursday', label: 'Qui' },
    { id: 'friday', label: 'Sex' },
    { id: 'saturday', label: 'Sáb' },
    { id: 'sunday', label: 'Dom' },
  ];

  const addMessage = () => {
    setMessages([...messages, []]);
    setCurrentStep(messages.length);
  };

  const handleFileUpload = async (e, type, step = currentStep, index = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const MAX_SIZE = 10 * 1024 * 1024; // Corrected to MB
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE);

    if (oversizedFiles.length > 0) {
      toast.error(`Alguns arquivos ultrapassam o tamanho máximo de 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Create a deep copy of messages to avoid direct state mutation
    const newMessages = messages.map(step => [...step]);
    if (!newMessages[step]) newMessages[step] = [];

    const tagMap = {
      image: 'imagem',
      video: 'video',
      audio: 'audio',
      document: 'doc'
    };

    const tagName = tagMap[type];

    // Ensure the step exists and is an array
    newMessages[step] = Array.isArray(newMessages[step]) ? newMessages[step] : [];

    // Find or create text message
    let textMessage = newMessages[step].find(m => m && m.type === 'text');
    if (!textMessage) {
      textMessage = { type: 'text', msg: '' };
      newMessages[step].unshift(textMessage);
    }

    setIsUploading(true);
    for (const file of files) {
      try {
        // Upload the file
        const formDataToSend = new FormData();
        formDataToSend.append("file", file);
        const fileUrl = await sendFile(formDataToSend);

        if (!fileUrl) {
          throw new Error('Falha ao enviar arquivo para o servidor');
        }

        const previewUrl = URL.createObjectURL(file);

        // Always create a new content object
        const content = {
          type,
          msg: file.name,
          mimetype: file.type,
          previewUrl,
          fileUrl
        };

        // For images, allow multiple: append; for others, replace existing of same type
        if (type === 'image') {
          newMessages[step] = [...newMessages[step], content];
        } else {
          newMessages[step] = newMessages[step]
            .filter(item => !item || item.type !== type)
            .concat([content]);
        }

        // Add the media tag to the text message
        if (tagName) {
          textMessage.msg = (textMessage.msg || '').trim() + ` {{${tagName} alt=""}}`;
        }

        setMessages([...newMessages]);
        toast.success(`Arquivo ${file.name} enviado com sucesso!`);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        toast.error(`Erro ao processar o arquivo: ${file.name}`);
      }
    }
    setIsUploading(false);
  };

  const removeContent = (stepIndex, contentIndex) => {
    const newMessages = [...messages];
    const messageToRemove = newMessages[stepIndex][contentIndex];
    const typeToRemove = messageToRemove.type;

    // Compute occurrence index among same-type attachments
    let sameTypeOccurrence = -1;
    let currentOccurrence = -1;
    for (let i = 0; i < newMessages[stepIndex].length; i++) {
      const item = newMessages[stepIndex][i];
      if (item && item.type !== 'text' && item.type === typeToRemove) {
        currentOccurrence++;
      }
      if (i === contentIndex) {
        sameTypeOccurrence = currentOccurrence;
        break;
      }
    }

    const tagMap = { image: 'imagem', video: 'video', audio: 'audio', document: 'doc' };
    const tagName = tagMap[typeToRemove];

    if (tagName && sameTypeOccurrence >= 0) {
      const textMessage = newMessages[stepIndex].find(m => m.type === 'text');
      if (textMessage && typeof textMessage.msg === 'string') {
        const tagRegex = new RegExp(`\\{\\{${tagName}[^}]*\\}\\}`, 'g');
        let occurrence = 0;
        let replaced = false;
        textMessage.msg = textMessage.msg.replace(tagRegex, (match) => {
          if (!replaced && occurrence === sameTypeOccurrence) {
            replaced = true;
            return '';
          }
          occurrence++;
          return match;
        })
          .replace(/\s{2,}/g, ' ')
          .replace(/(\s*\{\{quebra\}\}\s*){2,}/g, '{{quebra}}')
          .trim();
      }
    }

    newMessages[stepIndex] = newMessages[stepIndex].filter((_, idx) => idx !== contentIndex);
    setMessages(newMessages);
  };

  const updateMessage = (step, index, field, value) => {
    const newMessages = [...messages];
    newMessages[step][index] = { ...newMessages[step][index], [field]: value };
    setMessages(newMessages);
  };

  const predefinedVariables = ['quebra'];

  useEffect(() => {
    let contactVariables = [];
    if (selectedContactList) {
      const list = contacts.find(c => c._id === selectedContactList);
      if (list && list.variables) {
        contactVariables = list.variables;
      }
    }
    const allVariables = [...new Set([...predefinedVariables, ...contactVariables])];
    setVariables(allVariables);
  }, [selectedContactList, contacts]);

  const handleInsertVariable = (variable) => {
    const textarea = document.getElementById(`message-${currentStep}`);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const varToInsert = variable === 'undefined' ? 'quebra' : variable;
      const newText = text.substring(0, start) + `{{${varToInsert}}}` + text.substring(end);
      textarea.value = newText;

      const newMessages = [...messages];
      let textContent = newMessages[currentStep].find(m => m.type === 'text');
      if (textContent) {
        textContent.msg = newText;
      } else {
        if (!newMessages[currentStep]) newMessages[currentStep] = [];
        newMessages[currentStep].unshift({ type: 'text', msg: newText });
      }
      setMessages(newMessages);
      textarea.focus();
    }
  };

  // Build payload identical for Test and Submit
  const buildShotData = () => {
    const processedMessages = [];

    for (const step of messages) {
      if (!step || step.length === 0) continue;

      const processedStep = [];
      const stepMediaFiles = { images: [], videos: [], audios: [], documents: [] };

      for (const content of step) {
        if (content.fileUrl) {
          switch (content.type) {
            case 'image': stepMediaFiles.images.push(content.fileUrl); break;
            case 'video': stepMediaFiles.videos.push(content.fileUrl); break;
            case 'audio': stepMediaFiles.audios.push(content.fileUrl); break;
            case 'document': stepMediaFiles.documents.push(content.fileUrl); break;
          }
        }
      }

      const hasPlaceholders = step.some(c => c.type === 'text' && /\{\{(imagem|video|audio|doc)/.test(c.msg || ''));

      for (const content of step) {
        if (content.type === 'text' && content.msg) {
          const parsed = parseTemplate(content.msg, stepMediaFiles);
          if (Array.isArray(parsed)) {
            const nonEmpty = parsed.filter(msg => (typeof msg === 'string' ? msg.trim() !== '' : true));
            processedStep.push(...nonEmpty);
          } else if (parsed) {
            processedStep.push(parsed);
          }
        } else if (!hasPlaceholders && content.type !== 'text') {
          if (content.fileUrl) processedStep.push({ ...content });
        }
      }

      if (processedStep.length > 0) processedMessages.push(processedStep);
    }

    return {
      contactsId: formData.contactListId,
      connectionsSelect: formData.connectionsSelect,
      messages: processedMessages.filter(step => step.length > 0),
      config: {
        delayFrom: formData.config.delayFrom,
        delayTo: formData.config.delayTo,

        blockFrom: formData.config.blockFrom,
        blockTo: formData.config.blockTo,

        delayBlockFrom: formData.config.delayBlockFrom,
        delayBlockTo: formData.config.delayBlockTo,
        start: formData.config.start,
        startTime: formData.config.startTime,
        endTime: formData.config.endTime,
        period: formData.config.period
      }
    };
  };

  // Build parsed preview content for a single step so {{quebra}} acts as splitter
  const buildPreviewContent = (step) => {
    if (!Array.isArray(step) || step.length === 0) return [];
    const processedStep = [];

    const stepMediaFiles = { images: [], videos: [], audios: [], documents: [] };
    for (const content of step) {
      const url = content?.fileUrl || content?.previewUrl || content?.base64;
      if (url) {
        switch (content.type) {
          case 'image': stepMediaFiles.images.push(url); break;
          case 'video': stepMediaFiles.videos.push(url); break;
          case 'audio': stepMediaFiles.audios.push(url); break;
          case 'document': stepMediaFiles.documents.push(url); break;
        }
      }
    }

    const hasPlaceholders = step.some(c => c.type === 'text' && /\{\{(imagem|video|audio|doc)/.test(c.msg || ''));

    for (const content of step) {
      if (content.type === 'text' && content.msg) {
        const parsed = parseTemplate(content.msg, stepMediaFiles);
        if (Array.isArray(parsed)) {
          const nonEmpty = parsed.filter(msg => (typeof msg === 'string' ? msg.trim() !== '' : true));
          processedStep.push(...nonEmpty);
        } else if (parsed) {
          processedStep.push(parsed);
        }
      } else if (!hasPlaceholders && content.type !== 'text') {
        if (content.fileUrl || content.previewUrl || content.base64) processedStep.push({ ...content });
      }
    }

    // Normalize media items so they always render with media bubble and caption from alt
    return processedStep.map((item) => {
      if (!item || typeof item !== 'object') return item;
      if (["image", "video", "audio", "document"].includes(item.type)) {
        const fileUrl = item.fileUrl || item.previewUrl || item.base64 || "";
        const caption = item.caption || item.msg || "";
        return { ...item, fileUrl, caption };
      }
      return item;
    });
  };

  const handleTest = () => {
    const testData = buildShotData();
    console.log(testData, null, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Guard required fields with user-friendly toasts
    if (!formData.contactListId) {
      toast.error('Selecione uma lista de contatos.');
      return;
    }
    if (!Array.isArray(formData.connectionsSelect) || formData.connectionsSelect.length === 0) {
      toast.error('Selecione ao menos uma conexão.');
      return;
    }
    const hasMessageContent = messages.some(step => step && step.some(c => (c.type === 'text' && (c.msg || '').trim() !== '') || (c.type !== 'text' && !!c.fileUrl)));
    if (!hasMessageContent) {
      toast.error('Adicione ao menos uma mensagem ou anexo.');
      return;
    }
    if (formData.config.start === 'scheduled') {
      if (!formData.config.startTime || !formData.config.endTime) {
        toast.error('Defina o horário de início e término para o agendamento.');
        return;
      }
    } else {
      // Ensure immediate mode uses 00:00 for both times
      if (formData.config.startTime !== '00:00' || formData.config.endTime !== '00:00') {
        setFormData(prev => ({ ...prev, config: { ...prev.config, startTime: '00:00', endTime: '00:00' } }));
      }
    }

    const data = buildShotData();
    onSave(data);
  };

  const renderUploadingOverlay = () => {
    if (typeof document === 'undefined') return null;
    return isUploading && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-white ml-2">Enviando...</p>
      </div>
    );
  };

  const renderFileInputs = () => (
    <div className="hidden">
      <input
        type="file"
        ref={(el) => (fileInputRef.current.image = el)}
        accept="image/*"
        multiple
        onChange={(e) => handleFileUpload(e, 'image')}
      />
      <input
        type="file"
        ref={(el) => (fileInputRef.current.video = el)}
        accept="video/*"
        onChange={(e) => handleFileUpload(e, 'video')}
      />
      <input
        type="file"
        ref={(el) => (fileInputRef.current.document = el)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        onChange={(e) => handleFileUpload(e, 'document')}
      />
      <input
        type="file"
        ref={(el) => (fileInputRef.current.audio = el)}
        accept="audio/*"
        onChange={(e) => handleFileUpload(e, 'audio')}
      />
    </div>
  );

  // Simple form validity check used to disable submit and guard submission
  const isFormValid = () => {
    const hasContacts = !!formData.contactListId;
    const hasConnections = Array.isArray(formData.connectionsSelect) && formData.connectionsSelect.length > 0;
    const hasMessageContent = messages.some(step => step && step.some(c => (c.type === 'text' && (c.msg || '').trim() !== '') || (c.type !== 'text' && !!c.fileUrl)));
    const scheduleOk = formData.config.start === 'immediate'
      ? true
      : (formData.config.startTime && formData.config.endTime);
    return hasContacts && hasConnections && hasMessageContent && scheduleOk;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {renderUploadingOverlay()}
      {renderFileInputs()}
      {showPreviewModal && (
        <WhatsAppPreviewModal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          stepContent={buildPreviewContent(messages[previewStep] || [])}
          stepIndex={previewStep}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium">Nova Campanha</h1>
            <div className="flex items-center gap-2">
              {/* <Button
                type="button"
                onClick={handleTest}
                disabled={isLoading}
                variant="outline"
              >
                Testar
              </Button> */}
              <Button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : 'Iniciar'}
              </Button>
            </div>
          </div>

          {/* Contacts and Connections Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contacts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Lista de Contatos</CardTitle>
                <p className="text-sm text-gray-500">Selecione a lista de contatos</p>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={(value) => {
                    setSelectedContactList(value);
                    setFormData({ ...formData, contactListId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma lista" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact._id} value={contact._id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {contacts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-2">Nenhuma lista disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Connections Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Conexões</CardTitle>
                <p className="text-sm text-gray-500">Selecione as conexões</p>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={(value) => {
                    setFormData(prev => {
                      const currentSelections = Array.isArray(prev.connectionsSelect) ? [...prev.connectionsSelect] : [];
                      const newSelections = currentSelections.includes(value)
                        ? currentSelections.filter(v => v !== value)
                        : [...currentSelections, value];

                      return {
                        ...prev,
                        connectionsSelect: newSelections
                      };
                    });
                  }}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione as conexões">
                      {formData.connectionsSelect?.length > 0
                        ? `${formData.connectionsSelect.length} selecionada(s)`
                        : "Selecione as conexões"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {connections
                      .filter(conn => conn.status === 'open' && conn.heater === false)
                      .map(conn => (
                        <SelectItem
                          key={conn.instanceName}
                          value={conn.instanceName}
                          checked={formData.connectionsSelect?.includes(conn.instanceName)}
                        >
                          {conn.name || 'Conexão sem nome'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {connections.filter(conn => conn.status === 'open').length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-2">Nenhuma conexão disponível</p>
                )}
                {Array.isArray(formData.connectionsSelect) && formData.connectionsSelect.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.connectionsSelect.map(connId => {
                      const conn = connections.find(c => c.instanceName === connId);
                      return conn ? (
                        <span key={conn.instanceName} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {conn.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Mensagens</CardTitle>
              <p className="text-sm text-gray-500">Crie variações de mensagens para envio aleatório</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {messages.map((_, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={currentStep === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentStep(index)}
                  >
                    Passo {index + 1}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMessage}
                >
                  <Plus className="h-4 w-4 mr-1" /> Novo
                </Button>
              </div>

              {messages.map((step, stepIndex) => (
                <div key={stepIndex} className={`${currentStep === stepIndex ? 'block' : 'hidden'}`}>
                  <Card className="bg-gray-50 dark:bg-gray-700">
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">Variação {stepIndex + 1}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading || !((step.find(m => m.type === 'text')?.msg || '').trim())}
                          onClick={() => {
                            setPreviewStep(stepIndex);
                            setShowPreviewModal(true);
                          }}
                        >
                          Prévia
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (messages.length > 1) {
                              setMessages(messages.filter((_, i) => i !== stepIndex));
                              setCurrentStep(Math.max(0, currentStep - 1));
                            } else {
                              toast.warning('Pelo menos uma variação é necessária.');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`message-${stepIndex}`} className="text-sm font-medium">Mensagem</Label>
                        <Textarea
                          id={`message-${stepIndex}`}
                          value={(step.find(m => m.type === 'text')?.msg) || ''}
                          onChange={(e) => {
                            const newMessages = [...messages];
                            let textContent = newMessages[stepIndex].find(m => m.type === 'text');
                            if (textContent) {
                              textContent.msg = e.target.value;
                            } else {
                              if (!newMessages[stepIndex]) newMessages[stepIndex] = [];
                              newMessages[stepIndex].unshift({ type: 'text', msg: e.target.value });
                            }
                            setMessages(newMessages);
                          }}
                          placeholder="Digite sua mensagem aqui..."
                          className="mt-1 min-h-[100px]"
                        />
                        {variables.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Variáveis disponíveis:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {variables.map((variable, index) => {
                                const varName = typeof variable === 'string' ? variable : (variable.variable || 'quebra');
                                const varKey = typeof variable === 'string' ? `var-${index}` : variable._id;
                                return (
                                  <Button
                                    key={varKey}
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    onClick={() => handleInsertVariable(varName)}
                                  >
                                    {`{{${varName}}}`}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Anexos</Label>
                        <div className="flex gap-2 mt-1">
                          {['image', 'video', 'document', 'audio'].map(type => (
                            <Button
                              key={type}
                              variant="outline"
                              type="button"
                              size="sm"
                              onClick={() => {
                                const input = fileInputRef.current[type];
                                if (input) {
                                  input.multiple = type === 'image';
                                  input.value = '';
                                  input.click();
                                }
                              }}
                            >
                              {type === 'image' && <ImageIcon className="h-4 w-4 mr-1" />}
                              {type === 'video' && <VideoIcon className="h-4 w-4 mr-1" />}
                              {type === 'document' && <FileIcon className="h-4 w-4 mr-1" />}
                              {type === 'audio' && <FileAudio className="h-4 w-4 mr-1" />}
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {messages[stepIndex].filter(content => content.type !== 'text').map((content, contentIndex) => (
                          <div key={contentIndex} className="relative border rounded p-2">
                            {content.type === 'image' && (
                              <img
                                src={content.previewUrl || content.fileUrl}
                                alt="Imagem"
                                className="h-20 w-full object-contain"
                              />
                            )}
                            {content.type === 'video' && (
                              <video
                                src={content.previewUrl || content.fileUrl}
                                className="h-20 w-full"
                                controls
                              />
                            )}
                            {content.type === 'document' && (
                              <div className="flex items-center gap-2">
                                <FileIcon className="h-4 w-4 text-amber-500" />
                                <span className="text-sm truncate">{content.msg || 'Documento'}</span>
                              </div>
                            )}
                            {content.type === 'audio' && (
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileAudio className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">Áudio</span>
                                </div>
                                <audio
                                  src={content.previewUrl || content.fileUrl}
                                  controls
                                  className="w-full mt-1"
                                />
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6"
                              onClick={() => removeContent(stepIndex, contentIndex + 1)} // Adjust index for text
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Schedule Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-1.5  rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Agendamento
              </CardTitle>
              <p className="text-sm text-gray-600">Defina quando as mensagens serão enviadas</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Tipo de Início */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Tipo de Execução</Label>
                <RadioGroup
                  className="flex gap-8"
                  value={formData.config.start}
                  onValueChange={(value) => {
                    if (value === 'immediate') {
                      setFormData({
                        ...formData,
                        config: { ...formData.config, start: 'immediate', startTime: '00:00', endTime: '00:00' }
                      });
                    } else {
                      setFormData({
                        ...formData,
                        config: { ...formData.config, start: 'scheduled', startTime: formData.config.startTime || '', endTime: formData.config.endTime || '' }
                      });
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-100/50 transition-colors">
                    <RadioGroupItem id="start-immediate" value="immediate" />
                    <Label htmlFor="start-immediate" className="font-medium cursor-pointer">Imediato</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-100/50 transition-colors">
                    <RadioGroupItem id="start-scheduled" value="scheduled" />
                    <Label htmlFor="start-scheduled" className="font-medium cursor-pointer">Agendado</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Grid de Configurações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna Esquerda - Timing */}
                <div className="space-y-6">
                  {/* Intervalo entre mensagens - Always visible */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-green-100 rounded">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <Label className="text-sm font-semibold text-gray-700">Intervalo entre mensagens</Label>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Tempo de espera entre o envio de cada mensagem</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600 font-medium">Mínimo (segundos)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.config.delayFrom}
                          onChange={e => setFormData({ ...formData, config: { ...formData.config, delayFrom: parseInt(e.target.value) || 1 } })}
                          className="mt-1 h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 font-medium">Máximo (segundos)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.config.delayTo}
                          onChange={e => setFormData({ ...formData, config: { ...formData.config, delayTo: parseInt(e.target.value) || 1 } })}
                          className="mt-1 h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duração do bloco - Only for scheduled */}
                  {formData.config.start === 'scheduled' && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-purple-100 rounded">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <Label className="text-sm font-semibold text-gray-700">Quantidade por bloco</Label>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Quantidade de envios por bloco</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 font-medium">De (Bloco)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.config.blockFrom}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, blockFrom: parseInt(e.target.value) || 0 } })}
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 font-medium">Até (Bloco)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.config.blockTo}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, blockTo: parseInt(e.target.value) || 0 } })}
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pausa entre blocos - Only for scheduled */}
                  {formData.config.start === 'scheduled' && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-red-100 rounded">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <Label className="text-sm font-semibold text-gray-700">Pausa entre blocos</Label>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Tempo de espera após cada bloco de envio</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 font-medium">De (minutos)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.config.delayBlockFrom}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, delayBlockFrom: parseInt(e.target.value) || 0 } })}
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 font-medium">Até (minutos)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.config.delayBlockTo}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, delayBlockTo: parseInt(e.target.value) || 0 } })}
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coluna Direita - Horários e Dias - Only for scheduled */}
                {formData.config.start === 'scheduled' && (
                  <div className="space-y-6">
                    {/* Horário de envio */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-amber-100 rounded">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <Label className="text-sm font-semibold text-gray-700">Horário de envio</Label>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Período do dia para envio das mensagens</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 font-medium">Início</Label>
                          <Input
                            type="time"
                            value={formData.config.startTime}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, startTime: e.target.value } })}
                            disabled={formData.config.start === 'immediate'}
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 font-medium">Término</Label>
                          <Input
                            type="time"
                            value={formData.config.endTime}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, endTime: e.target.value } })}
                            disabled={formData.config.start === 'immediate'}
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dias da Semana */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-teal-100 rounded">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <Label className="text-sm font-semibold text-gray-700">Dias da Semana</Label>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Selecione os dias para envio</p>
                      <div className="grid grid-cols-7 gap-2">
                        {days.map(day => (
                          <Button
                            key={day.id}
                            type="button"
                            variant={formData.config.period.includes(day.id) ? "default" : "outline"}
                            className={`w-full p-0 h-10 text-xs font-medium transition-all duration-200 ${formData.config.period.includes(day.id)
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                              : "hover:bg-teal-50 hover:border-teal-300"
                              }`}
                            onClick={() => {
                              const newPeriod = formData.config.period.includes(day.id)
                                ? formData.config.period.filter(d => d !== day.id)
                                : [...formData.config.period, day.id];
                              setFormData({ ...formData, config: { ...formData.config, period: newPeriod } });
                            }}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
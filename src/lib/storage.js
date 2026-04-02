import localforage from 'localforage';

// Usamos IndexedDB do navegador para salvar as aulas do professor em formato PDF
// Isso permite que um arquivo de 50MB seja processado quase instantaneamente e seja salvo localmente.
// Zero custo de banda e latência inexistente na hora da aula!

localforage.config({
  name: 'GameClass',
  storeName: 'slides_db'
});

export const saveFileLocal = async (id, fileOrBlob) => {
  return await localforage.setItem(id, fileOrBlob);
};

export const getFileLocal = async (id) => {
  return await localforage.getItem(id);
};

export const deleteFileLocal = async (id) => {
  return await localforage.removeItem(id);
};

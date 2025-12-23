import React, { useState, useEffect, useContext } from 'react';
import { Check, Clock, Folder, FileText, ExternalLink } from 'lucide-react';
import { Modal } from './Documents/Modal';
import { ClientContext } from '../Data/ClientData';
import axios from 'axios';
import API_BASE_URL from '../config';

interface Document {
  doc_id: number;
  doc_name: string;
  doc_data: string | null;
  doc_type?: string;
  folder_id?: number;
}

interface Folder {
  folder_id: number;
  folder_name: string;
  importantDocuments: Document[];
  otherDocuments: Document[];
}

interface ClientDocumentData {
  id: string;
  name: string;
  company: string;
  importantDocuments: Document[];
  folders: Folder[];
  otherDocuments: Document[];
}

function DocumentItem({ doc }: { doc: Document }) {
  const handleClick = () => {
    if (doc.doc_data) {
      window.open(doc.doc_data, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between p-4 my-2 rounded-lg transition-all ${doc.doc_data
        ? 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
        : 'bg-gray-50 border border-gray-100 cursor-default'
        }`}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg mr-4 ${doc.doc_data ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
          }`}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{doc.doc_name}</h4>
          {doc.doc_type && (
            <p className="text-sm text-gray-500">
              {doc.doc_type}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {doc.doc_data ? (
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Uploaded
            </span>
            <ExternalLink className="w-5 h-5 text-blue-500" />
          </div>
        ) : (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-full flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        )}
      </div>
    </div>
  );
}

function ClientDocument({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [clientData, setClientData] = useState<ClientDocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clients } = useContext(ClientContext)!;

  useEffect(() => {
    const fetchClientDocuments = async () => {
      if (!isOpen || clients.length === 0) return;

      try {
        setLoading(true);
        const clientId = clients[0].client_id;
        const apiUrl = `${API_BASE_URL}/clientDataRoutes?client_id=${clientId}`;

        const response = await axios.get(apiUrl);

        // The API now returns properly structured data with folder IDs and organized documents
        setClientData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching client documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientDocuments();
  }, [isOpen, clients]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Documents'
      className="max-w-3xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading documents</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : clientData ? (
        <div className="space-y-6 p-6">
          {/* Important Documents Section (root level) */}
          {clientData.importantDocuments.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Important Documents</h3>
                  <p className="text-sm text-gray-500">Essential documents that require your attention</p>
                </div>
              </div>
              <div className="space-y-3">
                {clientData.importantDocuments.slice(0, 2).map((doc) => (
                  <DocumentItem key={`root-imp-${doc.doc_id}`} doc={doc} />
                ))}

              </div>
            </div>
          )}

          {/* Folders Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mr-3">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Document Folders</h3>
                <p className="text-sm text-gray-500">Organized collections of your documents</p>
              </div>
            </div>
            <div className="space-y-4">
              {clientData.folders.length > 0 ? (
                clientData.folders.map((folder) => (
                  <div
                    key={folder.folder_id}
                    onClick={() => setSelectedFolder(folder)}
                    className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mr-3">
                          <Folder className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {folder.folder_name}
                        </h4>
                      </div>
                      <div className="text-sm text-gray-500">
                        {folder.importantDocuments.filter(d => d.doc_data).length +
                          folder.otherDocuments.filter(d => d.doc_data).length}/
                        {folder.importantDocuments.length + folder.otherDocuments.length} uploaded
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.round(
                            (
                              (folder.importantDocuments.filter(d => d.doc_data).length +
                                folder.otherDocuments.filter(d => d.doc_data).length) /
                              (folder.importantDocuments.length + folder.otherDocuments.length)
                            ) * 100
                          ) || 0}%`
                        }}
                      ></div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Folder className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <h4 className="text-gray-500 font-medium">No document folders</h4>
                </div>
              )}
            </div>
          </div>

          {/* Other Documents Section (root level) */}
          {clientData.otherDocuments && clientData.otherDocuments.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Other Documents</h3>
                  <p className="text-sm text-gray-500">Additional documents not in folders</p>
                </div>
              </div>
              <div className="space-y-3">
                {clientData.otherDocuments.map((doc) => (
                  <DocumentItem key={`root-other-${doc.doc_id}`} doc={doc} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Folder Documents Modal */}
      <Modal
        isOpen={selectedFolder !== null}
        onClose={() => setSelectedFolder(null)}
        title={selectedFolder ? `${clientData?.name || 'Client'} - ${selectedFolder.folder_name}` : ''}
        className="max-w-2xl"
      >
        {selectedFolder && (
          <div className="space-y-6 p-6">
            {/* Important Documents in Folder */}
            {selectedFolder.importantDocuments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                    <Check className="w-5 h-5" />
                  </span>
                  Important Documents
                </h3>
                <div className="space-y-3">
                  {selectedFolder.importantDocuments.map((doc) => (
                    <DocumentItem key={`folder-imp-${doc.doc_id}`} doc={doc} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Documents in Folder */}
            {selectedFolder.otherDocuments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">
                    <FileText className="w-5 h-5" />
                  </span>
                  Other Documents
                </h3>
                <div className="space-y-3">
                  {selectedFolder.otherDocuments.map((doc) => (
                    <DocumentItem key={`folder-other-${doc.doc_id}`} doc={doc} />
                  ))}
                </div>
              </div>
            )}

            {selectedFolder.importantDocuments.length === 0 && selectedFolder.otherDocuments.length === 0 && (
              <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">No documents in this folder</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Modal>
  );
}

export default ClientDocument;
set NODE_TLS_REJECT_UNAUTHORIZED=0
wt debug --parse-body ./webtasks/LinkSave.js --secrets-file ./webtasks/.secrets --storage-file ./webtasks/.storage

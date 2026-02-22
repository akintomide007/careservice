#!/bin/bash

# Fix "not all code paths return" errors by ensuring all res.json/res.status calls have return

echo "Fixing controller return statements..."

# appointmentRequest.controller.ts
# Line 6 function (createRequest) - add return to res.status(201).json
sed -i 's/res.status(201).json(request);/return res.status(201).json(request);/' backend/src/controllers/appointmentRequest.controller.ts

# Line 75 function (getRequestById) - add return to final res.json
sed -i 's/^\s*res.json(request);$/      return res.json(request);/' backend/src/controllers/appointmentRequest.controller.ts

# Line 115 function (approveRequest) - add return to final res.json  
sed -i 's/^\([[:space:]]*\)res.json(request);$/\1return res.json(request);/' backend/src/controllers/appointmentRequest.controller.ts

# Line 147 function (rejectRequest) - add return to final res.json
# This one should already be covered by the previous sed

# notification.controller.ts
# Line 39 (getNotificationById) - add return to final res.json
sed -i '54s/res.json(notification);/return res.json(notification);/' backend/src/controllers/notification.controller.ts

# Line 62 (markAsRead) - add return to final res.json
sed -i '76s/res.json(updated);/return res.json(updated);/' backend/src/controllers/notification.controller.ts

# Line 95 (deleteNotification) - add return to final res.json  
sed -i '108s/res.json({ message: '\''Notification deleted'\'' });/return res.json({ message: '\''Notification deleted'\'' });/' backend/src/controllers/notification.controller.ts

# Line 174 (broadcastNotification) - add return to final res.json
sed -i '192s/res.json(result);/return res.json(result);/' backend/src/controllers/notification.controller.ts

# Line 197 (sendNotification) - add return to final res.json
sed -i '224s/res.json({ sent: notifications.length, notifications });/return res.json({ sent: notifications.length, notifications });/' backend/src/controllers/notification.controller.ts

# supportTicket.controller.ts  
# Line 50 (getTicketById) - add return to final res.json
sed -i '61s/res.json(ticket);/return res.json(ticket);/' backend/src/controllers/supportTicket.controller.ts

echo "Controller returns fixed!"

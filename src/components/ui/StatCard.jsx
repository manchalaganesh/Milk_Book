import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    blue: 'bg-primary/10 text-primary',
    green: 'bg-secondary/10 text-secondary',
    amber: 'bg-accent/10 text-accent',
    red: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </motion.div>
  );
}